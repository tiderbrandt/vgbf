import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Import the BlobStorage source to see if allowOverwrite is there
    const fs = require('fs')
    const path = require('path')
    
    // This won't work in production, but let's try a different approach
    // Let's create a simple test that shows what options are being passed to put()
    
    const { put } = await import('@vercel/blob')
    
    // Test the actual put call with our options to see if it works
    const testData = { test: 'data' }
    const testOptions = {
      access: 'public' as const,
      contentType: 'application/json',
      allowOverwrite: true,
    }
    
    console.log('Test options being used:', testOptions)
    
    try {
      const result = await put('test-overwrite.json', JSON.stringify(testData), testOptions)
      console.log('First put successful:', result.url)
      
      // Try to overwrite it
      const testData2 = { test: 'data updated' }
      const result2 = await put('test-overwrite.json', JSON.stringify(testData2), testOptions)
      console.log('Second put (overwrite) successful:', result2.url)
      
      return NextResponse.json({
        success: true,
        message: 'Overwrite test successful',
        firstResult: result.url,
        secondResult: result2.url,
        optionsUsed: testOptions
      })
      
    } catch (putError) {
      return NextResponse.json({
        success: false,
        message: 'Put operation failed',
        error: putError instanceof Error ? putError.message : String(putError),
        optionsUsed: testOptions
      })
    }
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
