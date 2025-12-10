'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdminBackButton from '@/components/AdminBackButton'
import { NewsArticle } from '@/types'
import ImageUpload from '@/components/admin/ImageUpload'
import { useToast } from '@/contexts/ToastContext'
import { useFormState } from '@/hooks'

type Props = {
  params: { id: string }
}

export default function EditNewsPage({ params }: Props) {
  const router = useRouter()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  
  // Initialize form state with our custom hook
  const { formData, updateField, updateFields, isSubmitting: saving, submit } = useFormState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    tags: '',
    featured: false,
    imageUrl: '',
    imageAlt: '',
  })
  
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [originalNews, setOriginalNews] = useState<NewsArticle | null>(null)

  const loadNews = useCallback(async () => {
    try {
      const response = await fetch('/api/news')
      const data = await response.json()
      if (data.success) {
        const news = data.data.find((n: NewsArticle) => n.id === params.id)
        if (news) {
          setOriginalNews(news)
          updateFields({
            title: news.title,
            excerpt: news.excerpt,
            content: news.content,
            author: news.author || '',
            tags: news.tags?.join(', ') || '',
            featured: news.featured || false,
            imageUrl: news.imageUrl || '',
            imageAlt: news.imageAlt || '',
          })

          // Check for saved draft
          if (typeof window !== 'undefined') {
            const savedDraft = localStorage.getItem(`news-edit-${params.id}`)
            if (savedDraft) {
              try {
                const draft = JSON.parse(savedDraft)
                updateFields(draft)
              } catch (error) {
                console.error('Error loading draft:', error)
              }
            }
          }
        } else {
          error('Nyhet inte hittad', 'Den begärda nyheten kunde inte hittas.')
          router.push('/admin')
        }
      }
    } catch (err) {
      console.error('Error loading news:', err)
      error('Fel vid laddning', 'Ett oväntat fel inträffade vid laddning av nyheten.')
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }, [params.id, error, router, updateFields])

  // Load news article
  useEffect(() => {
    loadNews()
  }, [loadNews])

  // Autosave functionality
  useEffect(() => {
    if (!originalNews) return

    const interval = setInterval(() => {
      if (formData.title || formData.content) {
        localStorage.setItem(`news-edit-${params.id}`, JSON.stringify(formData))
        setLastSaved(new Date())
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [formData, params.id, originalNews])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await submit(async (data) => {
      try {
        const newsData: Partial<NewsArticle> = {
          ...data,
          tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          slug: data.title.toLowerCase()
            .replace(/[åäö]/g, (char) => ({ 'å': 'a', 'ä': 'a', 'ö': 'o' }[char] || char))
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, ''),
          id: params.id,
        }

        const response = await fetch('/api/news', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('auth-token')}`,
          },
          body: JSON.stringify(newsData),
        })
        
        const responseData = await response.json()
        if (responseData.success) {
          // Clear draft
          localStorage.removeItem(`news-edit-${params.id}`)
          success('Nyhet uppdaterad!', 'Nyheten har uppdaterats framgångsrikt.')
          router.push('/admin')
        } else {
          error('Fel vid uppdatering', responseData.error || 'Ett oväntat fel inträffade.')
        }
      } catch (err) {
        console.error('Error updating news:', err)
        error('Fel vid uppdatering', 'Ett oväntat fel inträffade vid uppdatering av nyheten.')
      }
    })
  }

  const saveDraft = () => {
    localStorage.setItem(`news-edit-${params.id}`, JSON.stringify(formData))
    setLastSaved(new Date())
    success('Utkast sparat!', 'Utkastet har sparats lokalt.')
  }

  const resetToOriginal = () => {
    if (originalNews) {
      updateFields({
        title: originalNews.title,
        excerpt: originalNews.excerpt,
        content: originalNews.content,
        author: originalNews.author || '',
        tags: originalNews.tags?.join(', ') || '',
        featured: originalNews.featured || false,
        imageUrl: originalNews.imageUrl || '',
        imageAlt: originalNews.imageAlt || '',
      })
      localStorage.removeItem(`news-edit-${params.id}`)
      success('Återställt till original!', 'Formuläret har återställts till den ursprungliga nyheten.')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vgbf-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Laddar nyhet...</p>
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
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-vgbf-blue">Redigera nyhet</h1>
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
                  onClick={resetToOriginal}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Återställ
                </button>
                <AdminBackButton />
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
                    updateFields({ imageUrl, imageAlt })
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
                  {saving ? 'Uppdaterar...' : 'Uppdatera nyhet'}
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
