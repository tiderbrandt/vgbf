import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('Testing PUT to clubs API...')
    
    // Sample club data that would be sent in a PUT request
    const testClubUpdate = {
      id: "alingsas-bsk",
      name: "Alingsås BSK Updated",
      description: "Test update description",
      location: "Alingsås",
      email: "test@alingsas-bsk.se",
      city: "Alingsås"
    }
    
    // Get auth token first
    const authResponse = await fetch('https://vgbf.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: process.env.ADMIN_USERNAME,
        password: process.env.ADMIN_PASSWORD
      })
    })
    
    if (!authResponse.ok) {
      throw new Error(`Auth failed: ${authResponse.status}`)
    }
    
    const authData = await authResponse.json()
    console.log('Got auth token')
    
    // Now test PUT
    const putResponse = await fetch('https://vgbf.vercel.app/api/clubs', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`
      },
      body: JSON.stringify(testClubUpdate)
    })
    
    console.log('PUT response status:', putResponse.status)
    
    const responseText = await putResponse.text()
    console.log('PUT response text:', responseText)
    
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { rawResponse: responseText }
    }
    
    return NextResponse.json({
      success: putResponse.ok,
      status: putResponse.status,
      authSuccess: authResponse.ok,
      responseData,
      testData: testClubUpdate
    })
    
  } catch (error) {
    console.error('Test PUT error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
