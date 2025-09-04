import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { verifyAdminToken, createUnauthorizedResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  console.log('Upload API called')
  
  // Check authentication
  const authHeader = request.headers.get('authorization')
  if (!verifyAdminToken(authHeader)) {
    console.log('Upload authentication failed')
    return createUnauthorizedResponse()
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

    // Get file from request body (following Vercel docs pattern)
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const type = searchParams.get('type') || 'news';

    if (!filename) {
      console.error('No filename provided in query params');
      return NextResponse.json({ success: false, error: 'Filename is required' }, { status: 400 });
    }

    // Get the file from request body
    const body = await request.blob();
    
    if (!body || body.size === 0) {
      console.error('No file data in request body');
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    console.log('File data received:', { 
      fileName: filename, 
      fileSize: body.size, 
      fileType: body.type,
      type 
    });

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(body.type)) {
      console.error('Invalid file type:', body.type);
      return NextResponse.json({ success: false, error: `Invalid file type: ${body.type}` }, { status: 400 });
    }

    // Validate file size (4.5MB limit for server uploads per Vercel docs)
    if (body.size > 4.5 * 1024 * 1024) {
      console.error('File too large:', body.size);
      return NextResponse.json({ success: false, error: 'File too large (max 4.5MB for server uploads)' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const uniqueFileName = `${timestamp}-${randomString}-${filename}`;
    
    console.log('Attempting to upload to blob:', { fileName: uniqueFileName, blobPath: `uploads/${type}/${uniqueFileName}` });
    
    // Upload to Vercel Blob
    const blob = await put(`uploads/${type}/${uniqueFileName}`, body, {
      access: 'public',
    });

    console.log('File uploaded to Vercel Blob successfully:', blob.url);

    return NextResponse.json({ 
      success: true,
      data: {
        url: blob.url,
        fileName: uniqueFileName 
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
