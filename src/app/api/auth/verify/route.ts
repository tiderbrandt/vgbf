import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      )
    }

    try {
      const decoded = jwt.verify(token, jwtSecret) as any
      
      return NextResponse.json({
        success: true,
        user: { username: decoded.username, role: decoded.role }
      })
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
