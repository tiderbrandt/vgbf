import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('Testing Cloudinary import...')
    
    // Test if we can import cloudinary
    const cloudinary = await import('cloudinary')
    console.log('Cloudinary imported successfully')
    
    // Test if env vars are available
    const envVars = {
      cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasKey: !!process.env.CLOUDINARY_API_KEY,
      hasSecret: !!process.env.CLOUDINARY_API_SECRET,
      cloudNameValue: process.env.CLOUDINARY_CLOUD_NAME,
    }
    console.log('Cloudinary env check:', envVars)
    
    // Test if we can configure cloudinary
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
    console.log('Cloudinary configured successfully')
    
    return NextResponse.json({ 
      success: true,
      message: 'Cloudinary test passed',
      envVars
    });
  } catch (error) {
    console.error('Cloudinary test failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      stack: errorStack,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}
