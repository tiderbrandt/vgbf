'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdminBackButton from '@/components/AdminBackButton'

export default function EditDistriktsrekordInfoPage() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const response = await fetch('/api/admin/distriktsrekord-info')
      const data = await response.json()
      
      if (data.success) {
        setContent(data.data || '')
      } else {
        setMessage({ type: 'error', text: 'Kunde inte ladda information' })
      }
    } catch (error) {
      console.error('Error loading content:', error)
      setMessage({ type: 'error', text: 'Fel vid laddning av information' })
    } finally {
      setLoading(false)
    }
  }

  const saveContent = async () => {
    setSaving(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/admin/distriktsrekord-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Information sparad!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Kunde inte spara information' })
      }
    } catch (error) {
      console.error('Error saving content:', error)
      setMessage({ type: 'error', text: 'Fel vid sparande' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vgbf-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Laddar...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <AdminBackButton className="mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Redigera distriktsrekord-information</h1>
            <p className="text-gray-600 mt-2">
              Ändra informationstexten som visas på distriktsrekord-sidan
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Information om distriktsrekord
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vgbf-blue focus:border-transparent resize-vertical"
                placeholder="Skriv informationen om distriktsrekord här..."
              />
              <p className="mt-2 text-sm text-gray-500">
                Använd enkla radbrytningar för nya stycken. HTML-formatering stöds inte.
              </p>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-between items-center">
              <Link
                href="/admin"
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Avbryt
              </Link>
              
              <button
                onClick={saveContent}
                disabled={saving}
                className="bg-vgbf-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Sparar...' : 'Spara'}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-8 bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Förhandsvisning</h3>
              <div className="prose max-w-none text-gray-600">
                {content.split('\n').map((paragraph, index) => (
                  paragraph.trim() ? (
                    <p key={index} className="mb-4">
                      {paragraph.includes('@') && paragraph.includes('.') ? (
                        // Simple email detection
                        paragraph.split(' ').map((word, wordIndex) => {
                          if (word.includes('@') && word.includes('.')) {
                            return (
                              <span key={wordIndex}>
                                <a href={`mailto:${word}`} className="text-vgbf-blue hover:underline">
                                  {word}
                                </a>{' '}
                              </span>
                            )
                          }
                          return word + ' '
                        })
                      ) : (
                        paragraph
                      )}
                    </p>
                  ) : null
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
