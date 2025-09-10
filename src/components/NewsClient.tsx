'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NewsArticle } from '@/types'

export default function NewsClient() {
  const [news, setNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAuthor, setFilterAuthor] = useState('')
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'normal'>('all')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title'>('date-desc')

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

  // Get unique authors for filter dropdown
  const authors = useMemo(() => {
    const uniqueAuthors = Array.from(new Set(news.map(article => article.author).filter(Boolean)))
    return uniqueAuthors.sort()
  }, [news])

  // Filter and sort news articles
  const filteredAndSortedNews = useMemo(() => {
    let filtered = news.filter(article => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Author filter
      const matchesAuthor = filterAuthor === '' || article.author === filterAuthor
      
      // Featured filter
      const matchesFeatured = filterFeatured === 'all' || 
        (filterFeatured === 'featured' && article.featured) ||
        (filterFeatured === 'normal' && !article.featured)
      
      return matchesSearch && matchesAuthor && matchesFeatured
    })

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'date-desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'title':
          return a.title.localeCompare(b.title, 'sv')
        default:
          return 0
      }
    })

    return filtered
  }, [news, searchTerm, filterAuthor, filterFeatured, sortBy])

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setFilterAuthor('')
    setFilterFeatured('all')
    setSortBy('date-desc')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for search/filter section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Loading skeleton for news grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
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
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-red-600">Fel vid laddning av nyheter: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-3 bg-gradient-to-r from-vgbf-blue to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
          >
            Försök igen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sök nyheter
            </label>
            <input
              type="text"
              placeholder="Sök i titel eller innehåll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
            />
          </div>

          {/* Author Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Författare
            </label>
            <select
              value={filterAuthor}
              onChange={(e) => setFilterAuthor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
            >
              <option value="">Alla författare</option>
              {authors.map(author => (
                <option key={author} value={author}>{author}</option>
              ))}
            </select>
          </div>

          {/* Featured Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typ
            </label>
            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value as 'all' | 'featured' | 'normal')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
            >
              <option value="all">Alla nyheter</option>
              <option value="featured">Viktiga nyheter</option>
              <option value="normal">Vanliga nyheter</option>
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sortera
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date-desc' | 'date-asc' | 'title')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
            >
              <option value="date-desc">Senaste först</option>
              <option value="date-asc">Äldsta först</option>
              <option value="title">Alfabetisk ordning</option>
            </select>
          </div>
        </div>

        {/* Filter Summary and Clear Button */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-gray-600">
            Visar {filteredAndSortedNews.length} av {news.length} nyheter
            {(searchTerm || filterAuthor || filterFeatured !== 'all' || sortBy !== 'date-desc') && (
              <button
                onClick={clearFilters}
                className="ml-2 text-vgbf-blue hover:text-blue-700 underline"
              >
                Rensa filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAndSortedNews.map((article: NewsArticle) => (
          <article key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Av: {article.author}</span>
                <Link 
                  href={`/nyheter/${article.slug}`}
                  className="text-vgbf-blue hover:text-blue-700 font-medium inline-flex items-center transition-colors duration-200"
                >
                  Läs mer →
                </Link>
              </div>
            </div>
          </article>
        ))}
        {filteredAndSortedNews.length === 0 && !loading && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600">
              {searchTerm || filterAuthor || filterFeatured !== 'all' 
                ? 'Inga nyheter matchar dina sökkriterier.' 
                : 'Inga nyheter att visa för tillfället.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
