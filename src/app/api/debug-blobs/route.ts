import { NextRequest, NextResponse } from 'next/server'
import { list } from '@vercel/blob'

export async function GET() {
  try {
    console.log('Listing all blobs...')
    
    const { blobs } = await list()
    console.log('Found blobs:', blobs.length)
    
    // Show all blobs with their details
    const blobDetails = blobs.map(blob => ({
      pathname: blob.pathname,
      url: blob.url,
      size: blob.size,
      uploadedAt: blob.uploadedAt
    }))
    
    // Look specifically for clubs-related blobs
    const clubsBlobs = blobs.filter(blob => 
      blob.pathname.includes('clubs') || 
      blob.pathname.includes('data/clubs')
    )
    
    return NextResponse.json({
      success: true,
      totalBlobs: blobs.length,
      allBlobs: blobDetails,
      clubsBlobs: clubsBlobs.map(blob => ({
        pathname: blob.pathname,
        url: blob.url,
        size: blob.size
      })),
      expectedFilename: 'data/clubs.json'
    })
    
  } catch (error) {
    console.error('Error listing blobs:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
