'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import CompetitionsMap from '@/components/CompetitionsMap'
import CompetitionCard from '@/components/CompetitionCard'
import { Competition } from '@/types'

interface CompetitionsClientProps {
  initialCompetitions: Competition[]
}

export default function CompetitionsClient({ initialCompetitions }: CompetitionsClientProps) {
  const [competitions] = useState<Competition[]>(initialCompetitions)
  const [externalCompetitions, setExternalCompetitions] = useState<Competition[]>([])
  const [loadingExternal, setLoadingExternal] = useState(false)
  const [showExternal, setShowExternal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | Competition['category']>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (showExternal && externalCompetitions.length === 0) {
      loadExternalCompetitions()
    }
  }, [showExternal, externalCompetitions.length])

  const loadExternalCompetitions = async () => {
    try {
      setLoadingExternal(true)
      const response = await fetch('/api/external-competitions')
      const data = await response.json()
      if (data.success) {
        setExternalCompetitions(data.data)
      }
    } catch (error) {
      console.error('Error loading external competitions:', error)
    } finally {
      setLoadingExternal(false)
    }
  }

  // Combine local and external competitions when showing external
  const allCompetitions = useMemo(() => showExternal
    ? [...competitions, ...externalCompetitions]
    : competitions
    , [competitions, externalCompetitions, showExternal])

  const filteredCompetitions = useMemo(() => allCompetitions.filter(competition => {
    const statusMatch = filter === 'all' || competition.status === filter
    const categoryMatch = categoryFilter === 'all' || competition.category === categoryFilter

    // Search filter
    const searchLower = searchQuery.toLowerCase()
    const searchMatch = searchQuery === '' ||
      competition.title.toLowerCase().includes(searchLower) ||
      competition.location.toLowerCase().includes(searchLower) ||
      competition.organizer.toLowerCase().includes(searchLower)

    return statusMatch && categoryMatch && searchMatch
  }), [allCompetitions, filter, categoryFilter, searchQuery])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/tavlingar/kommande"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-blue-500 text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-vgbf-blue mb-2">Kommande tävlingar</h3>
            <p className="text-gray-600">Se alla tävlingar som kommer att äga rum</p>
          </Link>

          <Link
            href="/tavlingar/pagaende"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-green-500 text-4xl mb-4">🏹</div>
            <h3 className="text-xl font-bold text-vgbf-blue mb-2">Pågående tävlingar</h3>
            <p className="text-gray-600">Följ tävlingar som pågår just nu</p>
          </Link>

          <Link
            href="/tavlingar/avslutade"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-gray-500 text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-vgbf-blue mb-2">Avslutade tävlingar</h3>
            <p className="text-gray-600">Se resultat från genomförda tävlingar</p>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col gap-6">

            {/* Top row: Status & Categories */}
            <div className="flex flex-wrap gap-6 items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                <span className="font-medium text-gray-700 self-center">Status:</span>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-vgbf-blue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Alla
                </button>
                <button
                  onClick={() => setFilter('upcoming')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Kommande
                </button>
                <button
                  onClick={() => setFilter('ongoing')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'ongoing' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Pågående
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'completed' ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Avslutade
                </button>
              </div>

              <div className="flex gap-2 items-center">
                <span className="font-medium text-gray-700">Kategori:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
                  className="px-3 py-1 rounded border border-gray-300 text-sm focus:ring-2 focus:ring-vgbf-blue focus:border-transparent outline-none"
                >
                  <option value="all">Alla kategorier</option>
                  <option value="outdoor">Utomhus</option>
                  <option value="indoor">Inomhus</option>
                  <option value="3d">3D</option>
                  <option value="field">Fält</option>
                  <option value="other">Övrigt</option>
                </select>
              </div>
            </div>

            {/* Bottom row: Search & External Toggle */}
            <div className="flex flex-wrap gap-4 items-center justify-between border-t pt-4">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Sök tävling, plats eller arrangör..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-vgbf-blue focus:border-transparent outline-none"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showExternal}
                  onChange={(e) => setShowExternal(e.target.checked)}
                  className="w-4 h-4 text-vgbf-blue border-gray-300 rounded focus:ring-vgbf-blue"
                />
                <span className="font-medium text-gray-700">
                  Visa rikstävlingar
                  {loadingExternal && (
                    <span className="ml-2 inline-block w-4 h-4 border-2 border-gray-300 border-t-vgbf-blue rounded-full animate-spin"></span>
                  )}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-vgbf-blue mb-4">Hitta tävlingar på kartan</h2>
            <p className="text-gray-600 mb-4">
              Se var tävlingar äger rum. Klicka på markeringarna för mer information och direktlänkar till anmälan och resultat.
            </p>
            <CompetitionsMap competitions={filteredCompetitions} />
          </div>
        </div>

        {/* Competitions Grid */}
        {filteredCompetitions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏹</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Inga tävlingar hittades</h3>
            <p className="text-gray-500">
              {filter === 'all' && categoryFilter === 'all' && searchQuery === ''
                ? 'Det finns inga tävlingar att visa just nu.'
                : 'Inga tävlingar matchar dina filterkriterier.'
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompetitions.map((competition) => (
              <CompetitionCard key={competition.id} competition={competition} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
