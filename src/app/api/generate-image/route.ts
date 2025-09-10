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

    // Get settings to check which AI provider to use
    const settingsResult = await getSettings()
    if (!settingsResult.success || !settingsResult.data) {
      console.error('Settings loading failed:', settingsResult.error)
      return NextResponse.json(
        { success: false, error: 'Kunde inte ladda inställningar', debug: settingsResult.error },
        { status: 500 }
      )
    }

    const settings = settingsResult.data
    const provider = settings.aiImageProvider || 'openai'
    
    console.log('AI Image Generation Request:', {
      provider,
      hasOpenAI: !!settings.openaiApiKey,
      hasGemini: !!settings.geminiApiKey,
      hasEnvOpenAI: !!process.env.OPENAI_API_KEY,
      hasEnvGemini: !!process.env.GEMINI_API_KEY
    })
    
    // Check if we have the appropriate API key
    const openaiApiKey = settings.openaiApiKey || process.env.OPENAI_API_KEY
    const geminiApiKey = settings.geminiApiKey || process.env.GEMINI_API_KEY
    
    if (provider === 'openai' && !openaiApiKey) {
      console.error('OpenAI key missing')
      return NextResponse.json(
        { success: false, error: 'OpenAI API key inte konfigurerad', debug: 'No OpenAI key found in settings or environment' },
        { status: 500 }
      )
    }
    
    // Validate OpenAI API key format
    if (provider === 'openai' && openaiApiKey && !openaiApiKey.startsWith('sk-')) {
      console.error('Invalid OpenAI key format:', openaiApiKey.substring(0, 10) + '...')
      return NextResponse.json(
        { success: false, error: 'Ogiltig OpenAI API-nyckel format. Nyckeln ska börja med "sk-"', debug: 'API key does not start with sk-' },
        { status: 400 }
      )
    }
    
    if (provider === 'gemini' && !geminiApiKey) {
      console.error('Gemini key missing')
      return NextResponse.json(
        { success: false, error: 'Gemini API key inte konfigurerad', debug: 'No Gemini key found in settings or environment' },
        { status: 500 }
      )
    }

    // Enhanced prompt for archery/sports context
    const enhancedPrompt = `${prompt}. Professional high-quality image suitable for a Swedish archery federation website. Clean, bright, and engaging style. No text overlays.`

    if (provider === 'openai') {
      return await generateWithOpenAI(openaiApiKey!, enhancedPrompt, size, style)
    } else {
      return await generateWithGemini(geminiApiKey!, enhancedPrompt)
    }
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { success: false, error: 'Ett oväntat fel inträffade vid bildgenerering' },
      { status: 500 }
    )
  }
}

// OpenAI DALL-E 3 image generation
async function generateWithOpenAI(apiKey: string, prompt: string, size: string, style: string) {
  try {
    console.log('Starting OpenAI image generation:', {
      keyPrefix: apiKey.substring(0, 7) + '...',
      promptLength: prompt.length,
      size,
      style
    })

    const requestBody = {
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: size,
      quality: 'standard',
      style: style === 'photographic' ? 'natural' : 'vivid',
    }

    console.log('OpenAI request body:', requestBody)

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    console.log('OpenAI response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('OpenAI API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })

      // More specific error messages based on status code
      let errorMessage = 'OpenAI API fel'
      let debugInfo = `Status: ${response.status}`

      if (response.status === 401) {
        errorMessage = 'Ogiltig OpenAI API-nyckel. Kontrollera att nyckeln är korrekt.'
        debugInfo = 'API key authentication failed'
      } else if (response.status === 429) {
        errorMessage = 'OpenAI API gräns nådd. Försök igen senare eller kontrollera din kvot.'
        debugInfo = 'Rate limit or quota exceeded'
      } else if (response.status === 400) {
        const errorMsg = errorData?.error?.message || 'Ogiltigt request'
        errorMessage = `OpenAI request fel: ${errorMsg}`
        debugInfo = `Bad request: ${errorMsg}`
      } else if (response.status === 500) {
        errorMessage = 'OpenAI server fel. Försök igen senare.'
        debugInfo = 'OpenAI internal server error'
      } else {
        errorMessage = `OpenAI API fel (${response.status}): ${errorData?.error?.message || response.statusText}`
        debugInfo = `HTTP ${response.status}: ${errorData?.error?.message || response.statusText}`
      }

      return NextResponse.json(
        { 
          success: false, 
          error: errorMessage,
          debug: debugInfo,
          openaiError: errorData
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    if (!data.data || !data.data[0] || !data.data[0].url) {
      return NextResponse.json(
        { success: false, error: 'Ogiltig respons från OpenAI API' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        url: data.data[0].url,
        prompt: prompt,
        revisedPrompt: data.data[0].revised_prompt || prompt,
        provider: 'openai',
        model: 'dall-e-3'
      }
    })
  } catch (error) {
    console.error('OpenAI generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Ett fel inträffade vid OpenAI bildgenerering' },
      { status: 500 }
    )
  }
}

// Google Gemini image generation using Imagen
async function generateWithGemini(apiKey: string, prompt: string) {
  try {
    // Using Google AI Studio API for image generation
    // Note: This API endpoint might change - check Google's latest documentation
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-001:generateImage?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          text: prompt
        },
        generationConfig: {
          aspectRatio: "1:1",
          outputFormat: "PNG"
        }
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('Gemini API error:', errorData)
      
      // For now, fallback to a placeholder since Gemini Imagen API might not be fully available
      return NextResponse.json(
        { success: false, error: 'Gemini bildgenerering är inte tillgänglig ännu. Använd OpenAI istället.' },
        { status: 503 }
      )
    }

    const data = await response.json()
    
    // This structure might change based on actual Gemini API response
    if (!data.image || !data.image.url) {
      return NextResponse.json(
        { success: false, error: 'Ogiltig respons från Gemini API' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        url: data.image.url,
        prompt: prompt,
        revisedPrompt: prompt,
        provider: 'gemini',
        model: 'imagen-001'
      }
    })
  } catch (error) {
    console.error('Gemini generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Gemini bildgenerering är inte tillgänglig ännu. Använd OpenAI istället.' },
      { status: 503 }
    )
  }
}
