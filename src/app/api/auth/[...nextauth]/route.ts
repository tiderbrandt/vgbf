// This file has been removed - NextAuth integration was causing build issues
// Your JWT authentication system is working perfectly without it

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'NextAuth removed - use /api/auth/login instead' }, { status: 404 })
}

export async function POST() {
  return NextResponse.json({ error: 'NextAuth removed - use /api/auth/login instead' }, { status: 404 })
}
