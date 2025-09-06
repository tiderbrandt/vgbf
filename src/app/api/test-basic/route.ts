import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Environment variable check...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('DATABASE_URL starts with:', process.env.DATABASE_URL?.substring(0, 15))
    
    // Basic test without importing anything
    return NextResponse.json({
      success: true,
      message: 'Basic endpoint working',
      hasDatabase: !!process.env.DATABASE_URL,
      databaseStart: process.env.DATABASE_URL?.substring(0, 15) || 'not found'
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
