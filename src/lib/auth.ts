import jwt from 'jsonwebtoken'

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

export function createUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ success: false, message: 'Unauthorized' }),
    { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
