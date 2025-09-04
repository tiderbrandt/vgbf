import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  return NextResponse.json({
    environment: {
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      hasAdminUsername: !!process.env.ADMIN_USERNAME,
      hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      nodeEnv: process.env.NODE_ENV
    },
    auth: {
      hasAuthHeader: !!authHeader,
      authHeaderFormat: authHeader ? authHeader.substring(0, 20) + '...' : null,
      isValidToken: verifyAdminToken(authHeader)
    },
    timestamp: new Date().toISOString()
  });
}
