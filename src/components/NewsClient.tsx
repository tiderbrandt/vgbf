'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NewsArticle } from '@/types'

interface NewsClientProps {
  initialNews: NewsArticle[]
}

export default function NewsClient({ initialNews }: NewsClientProps) {
  const [news] = useState<NewsArticle[]>(initialNews)
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAuthor, setFilterAuthor] = useState('')
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'normal'>('all')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title'>('date-desc')

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
        {filteredAndSortedNews.length === 0 && (
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
