import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export function verifyAdminToken(authHeader: string | null): boolean {
  console.log('Auth verification started:', { authHeader: authHeader ? 'Present' : 'Missing' })
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Auth failed: No valid auth header')
    return false
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    console.log('Auth failed: No JWT_SECRET in environment')
    return false
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as any
    console.log('Auth successful:', { username: decoded.username, role: decoded.role })
    return decoded.role === 'admin'
  } catch (error) {
    console.log('Auth failed: Token verification error:', error)
    return false
  }
}

// New function that checks both Authorization header and cookies
export function verifyAdminAuth(request: NextRequest): boolean {
  console.log('Admin auth verification started')
  
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    console.log('Auth failed: No JWT_SECRET in environment')
    return false
  }

  // First, try Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const decoded = jwt.verify(token, jwtSecret) as any
      console.log('Auth successful via header:', { username: decoded.username, role: decoded.role })
      return decoded.role === 'admin'
    } catch (error) {
      console.log('Auth header token verification failed:', error)
    }
  }

  // Then, try cookie
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    const authToken = cookies['auth-token']
    if (authToken) {
      try {
        const decoded = jwt.verify(authToken, jwtSecret) as any
        console.log('Auth successful via cookie:', { username: decoded.username, role: decoded.role })
        return decoded.role === 'admin'
      } catch (error) {
        console.log('Auth cookie token verification failed:', error)
      }
    }
  }

  console.log('Auth failed: No valid token found in header or cookie')
  return false
}

export function createUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ success: false, message: 'Unauthorized' }),
    { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
