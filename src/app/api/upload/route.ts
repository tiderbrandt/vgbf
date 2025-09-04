import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('Upload API called')
  
  // Check authentication
  const authHeader = request.headers.get('authorization')
  if (!verifyAdminToken(authHeader)) {
    console.log('Upload authentication failed')
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN environment variable not found')
      return NextResponse.json({ 
        success: false,
        error: 'Blob storage not configured. Please add BLOB_READ_WRITE_TOKEN environment variable.' 
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

    // Generate unique filename to prevent conflicts
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const uniqueFileName = `${timestamp}-${randomString}-${filename}`;
    const blobPath = `uploads/${type}/${uniqueFileName}`;
    
    console.log('Uploading to blob:', { blobPath });
    
    // ⚠️ The below code is for App Router Route Handlers only
    const blob = await put(blobPath, request.body, {
      access: 'public',
    });

    console.log('File uploaded to Vercel Blob successfully:', blob.url);

    return NextResponse.json({ 
      success: true,
      data: {
        url: blob.url,
        fileName: uniqueFileName,
        downloadUrl: blob.downloadUrl 
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
