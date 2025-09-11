import { NextRequest, NextResponse } from 'next/server';

// This API uses Node-only libraries (cloudinary, Buffer). Ensure the route
// runs in the Node runtime instead of the Edge runtime to avoid runtime
// errors like "Buffer is not defined" or native module issues.
export const runtime = 'nodejs'
import { verifyAdminToken } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('Upload API called')
  
  // Check authentication
  const authHeader = request.headers.get('authorization')
  if (!verifyAdminToken(authHeader)) {
    console.log('Upload authentication failed')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary environment variables not found')
      return NextResponse.json({ 
        success: false,
        error: 'Image storage not configured. Please add Cloudinary environment variables.' 
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const type = searchParams.get('type') || 'news';

    if (!filename) {
      console.error('No filename provided in query params');
      return NextResponse.json({ success: false, error: 'Filename is required' }, { status: 400 });
    }

    console.log('Upload request:', { 
      filename, 
      type,
      hasBody: !!request.body,
      contentLength: request.headers.get('content-length')
    });

    // Validate request body exists
    if (!request.body) {
      console.error('No request body provided');
      return NextResponse.json({ success: false, error: 'No file data provided' }, { status: 400 });
    }

    // Convert request body to buffer
    const bytes = await request.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename to prevent conflicts
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const uniqueFileName = `${timestamp}-${randomString}-${filename}`;
    
    console.log('Uploading to Cloudinary:', { uniqueFileName, type });
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, {
      folder: `vgbf/${type}`,
      filename: uniqueFileName
    });

    console.log('File uploaded to Cloudinary successfully:', result.url);

    return NextResponse.json({ 
      success: true,
      data: {
        url: result.url,
        fileName: uniqueFileName,
        publicId: result.publicId,
        secureUrl: result.secureUrl,
        width: result.width,
        height: result.height
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    // Return more specific error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to upload file',
        details: errorMessage,
        timestamp: new Date().toISOString(),
        // Include more debug info in development
        ...(process.env.NODE_ENV === 'development' && { 
          stack: error instanceof Error ? error.stack : undefined,
          environment: {
            hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
            nodeEnv: process.env.NODE_ENV
          }
        })
      },
      { status: 500 }
    );
  }
}
