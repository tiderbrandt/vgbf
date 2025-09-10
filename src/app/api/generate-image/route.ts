import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth'
import { getSettings } from '@/lib/settings-storage-postgres'

// Interface for the image generation request
interface GenerateImageRequest {
  prompt: string
  style?: 'photographic' | 'digital-art' | 'cinematic' | 'anime' | 'photographic'
  size?: '1024x1024' | '1152x896' | '1216x832' | '1344x768' | '1536x640'
}

export async function POST(request: NextRequest) {
  try {
    console.log('AI Image Generation API called')
    
    // Verify authentication
    const isAuthenticated = verifyAdminAuth(request)
    if (!isAuthenticated) {
      console.log('Authentication failed')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Authentication successful')

    let body: GenerateImageRequest
    try {
      body = await request.json() as GenerateImageRequest
      console.log('Request body parsed:', { hasPrompt: !!body.prompt, promptLength: body.prompt?.length, style: body.style, size: body.size })
    } catch (error) {
      console.error('Failed to parse request body:', error)
      return NextResponse.json(
        { success: false, error: 'Ogiltigt request format', debug: 'Failed to parse JSON body' },
        { status: 400 }
      )
    }

    const { prompt, style = 'photographic', size = '1024x1024' } = body

    if (!prompt || prompt.trim().length === 0) {
      console.log('Prompt validation failed:', { prompt })
      return NextResponse.json(
        { success: false, error: 'Prompt är obligatorisk', debug: 'Empty or missing prompt' },
        { status: 400 }
      )
    }

    // Get settings to check for Hugging Face API key
    const settingsResult = await getSettings()
    if (!settingsResult.success || !settingsResult.data) {
      console.error('Settings loading failed:', settingsResult.error)
      return NextResponse.json(
        { success: false, error: 'Kunde inte ladda inställningar', debug: settingsResult.error },
        { status: 500 }
      )
    }

    const settings = settingsResult.data
    
    console.log('AI Image Generation Request:', {
      provider: 'huggingface',
      hasHuggingFace: !!settings.huggingfaceApiKey,
      hasEnvHuggingFace: !!process.env.HUGGINGFACE_API_KEY
    })
    
    // Check for Hugging Face API key
    const huggingfaceApiKey = settings.huggingfaceApiKey || process.env.HUGGINGFACE_API_KEY
    
    if (!huggingfaceApiKey) {
      console.error('Hugging Face key missing')
      return NextResponse.json(
        { success: false, error: 'Hugging Face API key inte konfigurerad', debug: 'No Hugging Face key found in settings or environment' },
        { status: 500 }
      )
    }

    // Enhanced prompt for archery/sports context
    const enhancedPrompt = `${prompt}. Professional high-quality image suitable for a Swedish archery federation website. Clean, bright, and engaging style. No text overlays.`

    console.log('Using Hugging Face AI provider')
    return await generateWithHuggingFace(huggingfaceApiKey, enhancedPrompt)
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { success: false, error: 'Ett oväntat fel inträffade vid bildgenerering' },
      { status: 500 }
    )
  }
}

// Hugging Face Stable Diffusion image generation
async function generateWithHuggingFace(apiKey: string, prompt: string) {
  try {
    console.log('Starting Hugging Face image generation:', {
      keyPrefix: apiKey.substring(0, 7) + '...',
      promptLength: prompt.length
    })

    // Using Stable Diffusion XL model via Hugging Face Inference API
    const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Wait-For-Model': 'true'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_inference_steps: 25,
          guidance_scale: 7.5,
          width: 1024,
          height: 1024
        }
      }),
    })

    console.log('Hugging Face response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('Hugging Face API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })

      // More specific error messages based on status code
      let errorMessage = 'Hugging Face API fel'
      let debugInfo = `Status: ${response.status}`

      if (response.status === 401) {
        errorMessage = 'Ogiltig Hugging Face API-nyckel. Kontrollera att nyckeln är korrekt.'
        debugInfo = 'API key authentication failed'
      } else if (response.status === 429) {
        errorMessage = 'Hugging Face API gräns nådd. Försök igen senare.'
        debugInfo = 'Rate limit exceeded'
      } else if (response.status === 503) {
        errorMessage = 'Modellen laddas fortfarande. Försök igen om 30 sekunder.'
        debugInfo = 'Model is loading'
      } else {
        errorMessage = `Hugging Face API fel (${response.status}): ${errorText}`
        debugInfo = `HTTP ${response.status}: ${errorText}`
      }

      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          debug: debugInfo
        },
        { status: response.status }
      )
    }

    // Hugging Face returns the image as binary data
    const imageBuffer = await response.arrayBuffer()
    
    if (!imageBuffer || imageBuffer.byteLength === 0) {
      return NextResponse.json(
        { success: false, error: 'Tom respons från Hugging Face API' },
        { status: 500 }
      )
    }

    // Convert to base64 for JSON response
    const base64Image = Buffer.from(imageBuffer).toString('base64')
    const dataUrl = `data:image/png;base64,${base64Image}`

    return NextResponse.json({
      success: true,
      data: {
        url: dataUrl,
        prompt: prompt,
        revisedPrompt: prompt,
        provider: 'huggingface',
        model: 'stable-diffusion-xl-base-1.0'
      }
    })
  } catch (error) {
    console.error('Hugging Face generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Ett fel inträffade vid Hugging Face bildgenerering' },
      { status: 500 }
    )
  }
}
