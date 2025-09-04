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
}

export default function ImageUpload({ onImageUploaded, currentImageUrl, currentImageAlt, contentType = 'news' }: ImageUploadProps) {
  const { success, error } = useToast()
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const [imageAlt, setImageAlt] = useState(currentImageAlt || '')
  const [dragOver, setDragOver] = useState(false)
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
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-vgbf-blue bg-blue-50'
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
            <div className="relative mx-auto w-32 h-32">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {uploading ? 'Laddar upp...' : 'Klicka för att ändra bild'}
              </p>
              {!uploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveImage()
                  }}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Ta bort bild
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {uploading ? 'Laddar upp...' : 'Dra och släpp en bild här, eller klicka för att välja'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WebP, GIF upp till 5MB
              </p>
            </div>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-vgbf-blue"></div>
              <span className="text-sm text-gray-600">Laddar upp...</span>
            </div>
          </div>
        )}
      </div>

      {/* Alt Text Input */}
      {previewUrl && (
        <div>
          <label htmlFor="imageAlt" className="block text-sm font-medium text-gray-700 mb-2">
            Alt-text för bild (för tillgänglighet)
          </label>
          <input
            type="text"
            id="imageAlt"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            placeholder="Beskrivning av bilden..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Beskriv vad som visas i bilden för personer som använder skärmläsare
          </p>
        </div>
      )}
    </div>
  )
}
