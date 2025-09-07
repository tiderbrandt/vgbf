import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('Environment check:')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN)
    
    // Try to import and use the BlobStorage directly
    const { BlobStorage } = await import('@/lib/storage/BlobStorage')
    const storage = new BlobStorage<any>('test-data.json')
    
    console.log('Testing BlobStorage...')
    
    // Try to read (should return empty array if no data)
    const data = await storage.read()
    console.log('Read data:', data)
    
    // Try to write some test data
    const testData = [{ id: 'test-1', name: 'Test Item', timestamp: new Date().toISOString() }]
    await storage.write(testData)
    console.log('Write successful')
    
    // Try to read again
    const newData = await storage.read()
    console.log('Read after write:', newData)
    
    return NextResponse.json({
      success: true,
      message: 'BlobStorage test completed successfully',
      environment: process.env.NODE_ENV,
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
      readData: data,
      writeData: testData,
      readAfterWrite: newData
    })
    
  } catch (error) {
    console.error('BlobStorage test error:', error)
    return NextResponse.json({
      success: false,
      message: 'BlobStorage test failed',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      environment: process.env.NODE_ENV,
      hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN
    }, { status: 500 })
  }
}
