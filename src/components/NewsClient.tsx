'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ShareButtons from './ShareButtons'
import { NewsArticle } from '@/types'

export default function NewsClient() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true)
        // Add timestamp to prevent any caching
        const timestamp = Date.now()
        const response = await fetch(`/api/news?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch news')
        }
        
        const data = await response.json()
        setNews(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Fel vid laddning av nyheter: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-vgbf-blue text-white rounded hover:bg-blue-600"
        >
          Försök igen
        </button>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {news.map((article: NewsArticle) => (
        <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          {article.imageUrl && (
            <div className="relative h-48">
              <Image
                src={article.imageUrl}
                alt={article.imageAlt || article.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-vgbf-gold font-medium">
                {new Date(article.date).toLocaleDateString('sv-SE')}
              </span>
              {article.featured && (
                <span className="text-xs bg-vgbf-gold text-white px-2 py-1 rounded">
                  Viktigt
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-vgbf-blue mb-3 line-clamp-2">
              <Link href={`/nyheter/${article.slug}`} className="hover:text-blue-600">
                {article.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">Av: {article.author}</span>
              <Link 
                href={`/nyheter/${article.slug}`}
                className="text-vgbf-blue hover:text-blue-600 font-medium inline-flex items-center"
              >
                Läs mer →
              </Link>
            </div>
            
            {/* Quick Share */}
            <div className="pt-3 border-t border-gray-100">
              <ShareButtons 
                url={`/nyheter/${article.slug}`}
                title={article.title}
                description={article.excerpt}
                size="sm"
                showLabel={false}
                className="justify-end"
              />
            </div>
          </div>
        </article>
      ))}
      {news.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-600">Inga nyheter att visa för tillfället.</p>
        </div>
      )}
    </div>
  )
}
