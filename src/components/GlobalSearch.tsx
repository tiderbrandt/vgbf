'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2, FileText, Trophy, MapPin, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'

type SearchResult = {
  id: string
  title: string
  type: 'news' | 'competition' | 'club' | 'record'
  url: string
  date?: string
  details?: string
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results)
        }
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(search, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSelect = (url: string) => {
    setIsOpen(false)
    setQuery('')
    router.push(url)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'news': return <FileText className="w-4 h-4" />
      case 'competition': return <Trophy className="w-4 h-4" />
      case 'club': return <MapPin className="w-4 h-4" />
      case 'record': return <Award className="w-4 h-4" />
      default: return <Search className="w-4 h-4" />
    }
  }

  const getLabel = (type: string) => {
    switch (type) {
      case 'news': return 'Nyhet'
      case 'competition': return 'Tävling'
      case 'club': return 'Klubb'
      case 'record': return 'Rekord'
      default: return 'Annat'
    }
  }

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Sök..."
          className="w-full md:w-64 pl-10 pr-4 py-2 rounded-full bg-blue-900/50 border border-blue-700 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-sm"
        />
        <div className="absolute left-3 top-2.5 text-blue-300">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-3 top-2.5 text-blue-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (query.length >= 2) && (
        <div className="absolute top-full right-0 left-0 mt-2 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100 text-left">
          {results.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto py-2">
              {results.map((result) => (
                <li key={`${result.type}-${result.id}`}>
                  <button
                    onClick={() => handleSelect(result.url)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="mt-1 text-gray-400">
                      {getIcon(result.type)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {result.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {getLabel(result.type)}
                        </span>
                        {result.date && (
                          <span className="text-xs text-gray-500">
                            {new Date(result.date).toLocaleDateString('sv-SE')}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              {isLoading ? 'Söker...' : 'Inga resultat hittades'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
