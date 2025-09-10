import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth'

// Interface for the image generation request
interface GenerateImageRequest {
  prompt: string
  style?: 'photographic' | 'digital-art' | 'cinematic' | 'anime' | 'photographic'
  size?: '1024x1024' | '1152x896' | '1216x832' | '1344x768' | '1536x640'
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const isAuthenticated = verifyAdminAuth(request)
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json() as GenerateImageRequest
    const { prompt, style = 'photographic', size = '1024x1024' } = body

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt är obligatorisk' },
        { status: 400 }
      )
    }

    // Check if we have an OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key inte konfigurerad' },
        { status: 500 }
      )
    }

    // Enhanced prompt for archery/sports context
    const enhancedPrompt = `${prompt}. Professional high-quality image suitable for a Swedish archery federation website. Clean, bright, and engaging style. No text overlays.`

    // Generate image using OpenAI DALL-E 3
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: 'standard',
        style: style === 'photographic' ? 'natural' : 'vivid',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error:', errorData)
      return NextResponse.json(
        { success: false, error: 'Fel vid bildgenerering' },
        { status: 500 }
      )
    }

    const data = await response.json()
    
    if (!data.data || !data.data[0] || !data.data[0].url) {
      return NextResponse.json(
        { success: false, error: 'Ingen bild genererad' },
        { status: 500 }
      )
    }

    // Return the generated image URL
    return NextResponse.json({
      success: true,
      data: {
        url: data.data[0].url,
        prompt: enhancedPrompt,
        revisedPrompt: data.data[0].revised_prompt || enhancedPrompt
      }
    })

  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Ett oväntat fel inträffade vid bildgenerering' },
      { status: 500 }
    )
  }
}
