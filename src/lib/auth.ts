import jwt from 'jsonwebtoken'

export function verifyAdminToken(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.substring(7) // Remove 'Bearer ' prefix
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    return false
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as any
    return decoded.role === 'admin'
  } catch (error) {
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
