'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { NewsArticle } from '@/types'
import { useToast } from '@/contexts/ToastContext'

export default function NewsAdminPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadNews()
  }, [])

  const loadNews = async () => {
    try {
      const response = await fetch('/api/news')
      const data = await response.json()
      if (data.success) {
        setNews(data.data)
      }
    } catch (error) {
      console.error('Error loading news:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteNews = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna nyhet?')) {
      return
    }

    setDeleting(id)
    try {
      const response = await fetch(`/api/news?id=${id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      if (data.success) {
        setNews(prev => prev.filter(article => article.id !== id))
        success('Nyhet borttagen!', 'Nyheten har tagits bort framgångsrikt.')
      } else {
        error('Fel vid borttagning', data.error || 'Ett oväntat fel inträffade.')
      }
    } catch (err) {
      console.error('Error deleting news:', err)
      error('Fel vid borttagning', 'Ett oväntat fel inträffade vid borttagning av nyheten.')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vgbf-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Laddar nyheter...</p>
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
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-vgbf-blue">Hantera nyheter</h1>
              <div className="flex gap-4">
                <Link
                  href="/admin/news/new"
                  className="bg-vgbf-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-vgbf-green transition-colors"
                >
                  Ny nyhet
                </Link>
                <Link
                  href="/admin"
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Tillbaka till admin
                </Link>
              </div>
            </div>

            {news.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📰</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Inga nyheter än</h3>
                <p className="text-gray-500 mb-6">Skapa din första nyhet för att komma igång.</p>
                <Link
                  href="/admin/news/new"
                  className="bg-vgbf-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-vgbf-green transition-colors"
                >
                  Skapa nyhet
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Titel</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Datum</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Författare</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {news.map((article) => (
                      <tr key={article.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{article.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {article.excerpt}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {new Date(article.date).toLocaleDateString('sv-SE')}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {article.author || 'Okänd'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-1">
                            {article.featured && (
                              <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Viktigt
                              </span>
                            )}
                            {article.imageUrl && (
                              <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Med bild
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/news/${article.id}/edit`}
                              className="text-vgbf-blue hover:text-blue-700 font-medium text-sm"
                            >
                              Redigera
                            </Link>
                            <Link
                              href={`/nyheter/${article.slug}`}
                              target="_blank"
                              className="text-green-600 hover:text-green-700 font-medium text-sm"
                            >
                              Visa
                            </Link>
                            <button
                              onClick={() => deleteNews(article.id)}
                              disabled={deleting === article.id}
                              className="text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                            >
                              {deleting === article.id ? 'Tar bort...' : 'Ta bort'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
