import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  console.log('Upload API called')
  
  try {
    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN environment variable not found')
      return NextResponse.json({ 
        success: false,
        error: 'Blob storage not configured' 
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    console.log('Form data received:', { 
      hasFile: !!file, 
      fileName: file?.name, 
      fileSize: file?.size, 
      fileType: file?.type,
      type 
    });

    if (!file) {
      console.error('No file provided in form data');
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (!type) {
      console.error('No type provided in form data');
      return NextResponse.json({ success: false, error: 'No type provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json({ success: false, error: `Invalid file type: ${file.type}` }, { status: 400 });
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large:', file.size);
      return NextResponse.json({ success: false, error: 'File too large' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}-${randomString}-${file.name}`;
    
    console.log('Attempting to upload to blob:', { fileName, blobPath: `uploads/${type}/${fileName}` });
    
    // Upload to Vercel Blob
    const blob = await put(`uploads/${type}/${fileName}`, file, {
      access: 'public',
    });

    console.log('File uploaded to Vercel Blob successfully:', blob.url);

    return NextResponse.json({ 
      success: true,
      data: {
        url: blob.url,
        fileName 
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Return more specific error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to upload file',
        details: errorMessage,
        // Include stack trace in development
        ...(process.env.NODE_ENV === 'development' && { stack: error instanceof Error ? error.stack : undefined })
      },
      { status: 500 }
    );
  }
}
