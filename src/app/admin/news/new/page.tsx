'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { NewsArticle } from '@/types'
import ImageUpload from '@/components/admin/ImageUpload'
import { useToast } from '@/contexts/ToastContext'
import { authenticatedApiCall } from '@/lib/api'
import { useFormState } from '@/hooks/useFormState'

export default function NewNewsPage() {
  const router = useRouter()
  const { success, error } = useToast()
  
  // Initialize form state with our custom hook
  const { formData, updateField, reset } = useFormState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    tags: '',
    featured: false,
    imageUrl: '',
    imageAlt: '',
  })
  
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Autosave functionality
  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      const savedDraft = localStorage.getItem('news-draft')
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft)
          reset(draft)
        } catch (error) {
          console.error('Error loading draft:', error)
        }
      }
    }
  }, [reset])

  // Save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Only access localStorage on the client side
      if (typeof window !== 'undefined' && (formData.title || formData.content)) {
        localStorage.setItem('news-draft', JSON.stringify(formData))
        setLastSaved(new Date())
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const newsData: Partial<NewsArticle> = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        slug: formData.title.toLowerCase()
          .replace(/[åäö]/g, (char) => ({ 'å': 'a', 'ä': 'a', 'ö': 'o' }[char] || char))
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, ''),
        date: new Date().toISOString().split('T')[0],
        id: Date.now().toString(),
      }

      const response = await authenticatedApiCall('/api/news', {
        method: 'POST',
        body: JSON.stringify(newsData),
      })
      
      const data = await response.json()
      if (data.success) {
        // Clear draft
        if (typeof window !== 'undefined') {
          localStorage.removeItem('news-draft')
        }
        success('Nyhet publicerad!', 'Nyheten har publicerats framgångsrikt.')
        router.push('/admin')
      } else {
        error('Fel vid publicering', data.error || 'Ett oväntat fel inträffade.')
      }
    } catch (err) {
      console.error('Error saving news:', err)
      error('Fel vid publicering', 'Ett oväntat fel inträffade vid publicering av nyheten.')
    } finally {
      setSaving(false)
    }
  }

  const saveDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('news-draft', JSON.stringify(formData))
      setLastSaved(new Date())
      success('Utkast sparat!', 'Utkastet har sparats lokalt.')
    }
  }

  const clearDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('news-draft')
    }
    reset()
    success('Utkast raderat!', 'Utkastet har raderats och formuläret har återställts.')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-vgbf-blue">Skapa ny nyhet</h1>
              <div className="flex items-center gap-4">
                {lastSaved && (
                  <span className="text-sm text-gray-500">
                    Senast sparat: {lastSaved.toLocaleTimeString('sv-SE')}
                  </span>
                )}
                <button
                  type="button"
                  onClick={saveDraft}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Spara utkast
                </button>
                <button
                  type="button"
                  onClick={clearDraft}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Rensa
                </button>
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Tillbaka
                </Link>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Rubrik *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent text-lg"
                  placeholder="Skriv en engagerande rubrik..."
                />
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Utdrag *
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => updateField('excerpt', e.target.value)}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                  placeholder="En kort beskrivning som visas på nyhetssidan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bild
                </label>
                <ImageUpload
                  onImageUploaded={(imageUrl: string, imageAlt: string) => {
                    updateField('imageUrl', imageUrl);
                    updateField('imageAlt', imageAlt);
                  }}
                  currentImageUrl={formData.imageUrl}
                  currentImageAlt={formData.imageAlt}
                  newsTitle={formData.title}
                  newsExcerpt={formData.excerpt}
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Innehåll *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={(e) => updateField('content', e.target.value)}
                  required
                  rows={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                  placeholder="Skriv hela artikeln här..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                    Författare
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={(e) => updateField('author', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    placeholder="Ditt namn..."
                  />
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    Taggar (separera med komma)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={(e) => updateField('tags', e.target.value)}
                    placeholder="t.ex. Tävling, Utbildning, Viktigt"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={(e) => updateField('featured', e.target.checked)}
                  className="h-5 w-5 text-vgbf-blue focus:ring-vgbf-blue border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-3 block text-sm font-medium text-gray-700">
                  Markera som viktig nyhet (visas med gul bakgrund)
                </label>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-vgbf-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-vgbf-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Publicerar...' : 'Publicera nyhet'}
                </button>
                <Link
                  href="/admin"
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Avbryt
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
