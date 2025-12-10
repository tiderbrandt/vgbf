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

  const ITEMS_PER_PAGE = 9

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAuthor, setFilterAuthor] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'normal'>('all')
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title'>('date-desc')
  const [currentPage, setCurrentPage] = useState(1)

  // Get unique authors and tags for filter dropdowns
  const { authors, tags } = useMemo(() => {
    const uniqueAuthors = Array.from(new Set(news.map(article => article.author).filter(Boolean)))
    const uniqueTags = Array.from(new Set(news.flatMap(article => article.tags || []).filter(Boolean)))
    return {
      authors: uniqueAuthors.sort(),
      tags: uniqueTags.sort()
    }
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

      // Tag filter
      const matchesTag = filterTag === '' || (article.tags && article.tags.includes(filterTag))

      return matchesSearch && matchesAuthor && matchesFeatured && matchesTag
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
  }, [news, searchTerm, filterAuthor, filterFeatured, filterTag, sortBy])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedNews.length / ITEMS_PER_PAGE)
  const currentNews = filteredAndSortedNews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, filterAuthor, filterFeatured, filterTag, sortBy])

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setFilterAuthor('')
    setFilterTag('')
    setFilterFeatured('all')
    setSortBy('date-desc')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

          {/* Tag Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori/Tag
            </label>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
            >
              <option value="">Alla kategorier</option>
              {tags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
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
            Visar {currentNews.length} av {filteredAndSortedNews.length} (Totalt {news.length})
            {(searchTerm || filterAuthor || filterTag || filterFeatured !== 'all' || sortBy !== 'date-desc') && (
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
        {currentNews.map((article: NewsArticle) => (
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Föregående
          </button>

          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-md flex items-center justify-center ${currentPage === page
                  ? 'bg-vgbf-blue text-white'
                  : 'border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Nästa
          </button>
        </div>
      )}
    </div>
  )
}
