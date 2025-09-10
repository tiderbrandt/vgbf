'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Cookies from 'js-cookie'
import { useToast } from '@/contexts/ToastContext'
import { authenticatedUpload } from '@/lib/api'

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string, imageAlt: string) => void
  currentImageUrl?: string
  currentImageAlt?: string
  contentType?: string
  newsTitle?: string // For AI image generation
  newsExcerpt?: string // For AI image generation
}

export default function ImageUpload({ 
  onImageUploaded, 
  currentImageUrl, 
  currentImageAlt, 
  contentType = 'news',
  newsTitle,
  newsExcerpt
}: ImageUploadProps) {
  const { success, error } = useToast()
  const [uploading, setUploading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [imageAlt, setImageAlt] = useState(currentImageAlt || '')
  const [dragOver, setDragOver] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiStyle, setAiStyle] = useState<'photographic' | 'digital-art' | 'cinematic'>('photographic')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error('Fel filtyp', 'Vänligen välj en bildfil (JPEG, PNG, WebP, GIF)')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      error('Filen är för stor', 'Bilden är för stor. Maximal storlek är 5MB.')
      return
    }

    setUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file using the Vercel Blob pattern with authentication
      const token = Cookies.get('auth-token');
      
      if (!token) {
        error('Ej inloggad', 'Du måste vara inloggad för att ladda upp bilder.');
        setUploading(false);
        return;
      }
      
      const response = await fetch(
        `/api/upload?filename=${encodeURIComponent(file.name)}&type=${encodeURIComponent(contentType)}`,
        {
          method: 'POST',
          body: file,
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        },
      );

      const data = await response.json()

      if (data.success) {
        onImageUploaded(data.data.url, imageAlt || file.name)
        success('Bild uppladdad!', 'Bilden har laddats upp framgångsrikt.')
      } else {
        error('Fel vid uppladdning', data.error || 'Ett oväntat fel inträffade.')
        setPreviewUrl(currentImageUrl || null)
      }
    } catch (err) {
      console.error('Upload error:', err)
      error('Fel vid uppladdning', 'Ett oväntat fel inträffade vid uppladdning av bilden.')
      setPreviewUrl(currentImageUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const generateAIImage = async () => {
    if (!aiPrompt.trim()) {
      error('Prompt saknas', 'Vänligen skriv en beskrivning av bilden du vill generera.')
      return
    }

    setGenerating(true)

    try {
      const token = Cookies.get('auth-token')
      
      if (!token) {
        error('Ej inloggad', 'Du måste vara inloggad för att generera bilder.')
        return
      }

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          style: aiStyle,
          size: '1024x1024'
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPreviewUrl(data.data.url)
        onImageUploaded(data.data.url, aiPrompt)
        setImageAlt(aiPrompt)
        const providerName = data.data.provider === 'openai' ? 'OpenAI DALL-E 3' : 'Google Gemini'
        success('Bild genererad!', `AI-bilden har genererats framgångsrikt med ${providerName}.`)
        setShowAIGenerator(false)
      } else {
        error('Fel vid bildgenerering', data.error || 'Ett oväntat fel inträffade.')
      }
    } catch (err) {
      console.error('AI generation error:', err)
      error('Fel vid bildgenerering', 'Ett oväntat fel inträffade vid bildgenerering.')
    } finally {
      setGenerating(false)
    }
  }

  const generatePromptFromNews = () => {
    if (newsTitle || newsExcerpt) {
      const basePrompt = `Create a professional image for a Swedish archery federation news article titled "${newsTitle || ''}". ${newsExcerpt || ''} The image should be suitable for an archery/sports website, clean and engaging.`
      setAiPrompt(basePrompt)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    setImageAlt('')
    onImageUploaded('', '')
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      {/* Upload Methods Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setShowAIGenerator(false)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              !showAIGenerator
                ? 'border-vgbf-blue text-vgbf-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📁 Ladda upp fil
          </button>
          <button
            type="button"
            onClick={() => setShowAIGenerator(true)}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              showAIGenerator
                ? 'border-vgbf-blue text-vgbf-blue'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🎨 Generera med AI
          </button>
        </nav>
      </div>

      {!showAIGenerator ? (
        /* File Upload Area */
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            dragOver
              ? 'border-vgbf-blue bg-blue-50 scale-[1.02]'
              : 'border-gray-300 hover:border-vgbf-blue hover:bg-gray-50'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={uploading}
          />

          {previewUrl ? (
            <div className="space-y-4">
              <div className="relative mx-auto w-40 h-40">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover rounded-xl shadow-lg"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">
                  {uploading ? 'Laddar upp...' : 'Klicka för att ändra bild'}
                </p>
                {!uploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveImage()
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                  >
                    🗑️ Ta bort bild
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="mx-auto w-16 h-16 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  {uploading ? 'Laddar upp...' : 'Ladda upp en bild'}
                </p>
                <p className="text-sm text-gray-600">
                  Dra och släpp en bild här, eller klicka för att välja
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG, WebP, GIF upp till 5MB
                </p>
              </div>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vgbf-blue"></div>
                <span className="text-sm text-gray-600 font-medium">Laddar upp...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* AI Image Generator */
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 text-purple-500 mb-4">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">AI Bildgenerator</h3>
              <p className="text-sm text-gray-600">Generera en anpassad bild för din nyhet med hjälp av AI</p>
            </div>

            {(newsTitle || newsExcerpt) && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">🎯 Smart förslag</span>
                  <button
                    type="button"
                    onClick={generatePromptFromNews}
                    className="text-xs bg-vgbf-blue text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    Använd nyhetsinformation
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  Vi kan skapa en prompt baserat på din nyhets titel och innehåll
                </p>
              </div>
            )}

            <div>
              <label htmlFor="aiPrompt" className="block text-sm font-medium text-gray-700 mb-2">
                Beskrivning av bild
              </label>
              <textarea
                id="aiPrompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Beskriv vilken typ av bild du vill generera, t.ex. 'En bågsskytt som siktar mot en måltavla i en skog under gyllene timmen'"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Var specifik! Inkludera detaljer som miljö, ljusförhållanden, och känsla.
              </p>
            </div>

            <div>
              <label htmlFor="aiStyle" className="block text-sm font-medium text-gray-700 mb-2">
                Bildstil
              </label>
              <select
                id="aiStyle"
                value={aiStyle}
                onChange={(e) => setAiStyle(e.target.value as 'photographic' | 'digital-art' | 'cinematic')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="photographic">📸 Fotografisk (realistisk)</option>
                <option value="digital-art">🎨 Digital konst</option>
                <option value="cinematic">🎬 Cinematisk</option>
              </select>
            </div>

            {previewUrl && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Genererad bild:</h4>
                <div className="relative mx-auto w-40 h-40 mb-3">
                  <Image
                    src={previewUrl}
                    alt="Generated preview"
                    fill
                    className="object-cover rounded-lg shadow-md"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                >
                  🗑️ Ta bort och generera ny
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={generateAIImage}
              disabled={generating || !aiPrompt.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100"
            >
              {generating ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Genererar bild...</span>
                </div>
              ) : (
                <span>✨ Generera bild med AI</span>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Bildgenerering kan ta 10-30 sekunder. Var vänlig och vänta.
            </p>
          </div>
        </div>
      )}

      {/* Alt Text Input */}
      {previewUrl && (
        <div className="bg-gray-50 rounded-lg p-4">
          <label htmlFor="imageAlt" className="block text-sm font-medium text-gray-700 mb-2">
            📝 Alt-text för bild (för tillgänglighet)
          </label>
          <input
            type="text"
            id="imageAlt"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            placeholder="Beskrivning av bilden..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-2">
            💡 Beskriv vad som visas i bilden för personer som använder skärmläsare
          </p>
        </div>
      )}
    </div>
  )
}
