import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple middleware for basic route protection
// Your actual auth is handled by JWT tokens in API routes
export function middleware(request: NextRequest) {
  // For now, just allow all routes
  // Your API routes already handle JWT authentication properly
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes that don't need protection
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
