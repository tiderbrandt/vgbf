import { NextRequest, NextResponse } from 'next/server'
import { getDistriktsrekordInfo, updateDistriktsrekordInfo } from '@/lib/settings-storage-postgres'

export async function GET() {
  try {
    const result = await getDistriktsrekordInfo()
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Error in distriktsrekord info API:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json({ success: false, error: 'Content is required' }, { status: 400 })
    }

    const result = await updateDistriktsrekordInfo(content)
    
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in distriktsrekord info API:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
