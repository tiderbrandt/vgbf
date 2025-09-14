'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import CompetitionsMap from '@/components/CompetitionsMap'
import { Competition } from '@/types'

export default function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [externalCompetitions, setExternalCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingExternal, setLoadingExternal] = useState(false)
  const [showExternal, setShowExternal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | Competition['category']>('all')

  useEffect(() => {
    loadCompetitions()
  }, [])

  useEffect(() => {
    if (showExternal && externalCompetitions.length === 0) {
      loadExternalCompetitions()
    }
  }, [showExternal, externalCompetitions.length])

  const loadCompetitions = async () => {
    try {
      const response = await fetch('/api/competitions')
      const data = await response.json()
      if (data.success) {
        setCompetitions(data.data)
      }
    } catch (error) {
      console.error('Error loading competitions:', error)
    } finally {
      setLoading(false)
    }
  }

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
  const allCompetitions = showExternal 
    ? [...competitions, ...externalCompetitions]
    : competitions

  const filteredCompetitions = allCompetitions.filter(competition => {
    const statusMatch = filter === 'all' || competition.status === filter
    const categoryMatch = categoryFilter === 'all' || competition.category === categoryFilter
    return statusMatch && categoryMatch
  })

  const getStatusBadge = (status: Competition['status']) => {
    const styles = {
      upcoming: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800'
    }
    
    const labels = {
      upcoming: 'Kommande',
      ongoing: 'Pågående',
      completed: 'Avslutad'
    }

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getCategoryBadge = (category: Competition['category']) => {
    const styles = {
      outdoor: 'bg-green-100 text-green-800',
      indoor: 'bg-purple-100 text-purple-800',
      '3d': 'bg-orange-100 text-orange-800',
      field: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    }
    
    const labels = {
      outdoor: 'Utomhus',
      indoor: 'Inomhus',
      '3d': '3D',
      field: 'Fält',
      other: 'Övrigt'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[category]}`}>
        {labels[category]}
      </span>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vgbf-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Laddar tävlingar...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 page-with-logo-bg">
      <Header />
      
      <PageHero 
        title="Tävlingar"
        description="Upptäck kommande tävlingar, följ pågående evenemang och se resultat från avslutade tävlingar"
        subtitle="Här hittar du alla tävlingar inom distriktet samt externa tävlingar som kan vara av intresse."
      />
      
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
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex gap-2">
                <span className="font-medium text-gray-700">Status:</span>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'all' ? 'bg-vgbf-blue text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Alla
                </button>
                <button
                  onClick={() => setFilter('upcoming')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'upcoming' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Kommande
                </button>
                <button
                  onClick={() => setFilter('ongoing')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'ongoing' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Pågående
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'completed' ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Avslutade
                </button>
              </div>

              <div className="flex gap-2">
                <span className="font-medium text-gray-700">Kategori:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
                  className="px-3 py-1 rounded border border-gray-300 text-sm"
                >
                  <option value="all">Alla kategorier</option>
                  <option value="outdoor">Utomhus</option>
                  <option value="indoor">Inomhus</option>
                  <option value="3d">3D</option>
                  <option value="field">Fält</option>
                  <option value="other">Övrigt</option>
                </select>
              </div>

              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-2 cursor-pointer">
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
                {filter === 'all' && categoryFilter === 'all' 
                  ? 'Det finns inga tävlingar att visa just nu.'
                  : 'Inga tävlingar matchar dina filterkriterier.'
                }
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompetitions.map((competition) => (
                <div key={competition.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {competition.imageUrl && (
                    <Image
                      src={competition.imageUrl}
                      alt={competition.imageAlt || competition.title}
                      width={400}
                      height={192}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-vgbf-blue">{competition.title}</h3>
                        {competition.isExternal && (
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              🔗 Rikstävling
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(competition.status)}
                        {getCategoryBadge(competition.category)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">{competition.description}</p>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">📅 Datum:</span>
                        {new Date(competition.date).toLocaleDateString('sv-SE')}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">📍 Plats:</span>
                        {competition.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">👥 Arrangör:</span>
                        {competition.organizer}
                      </div>
                      {competition.fee && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">💰 Avgift:</span>
                          {competition.fee}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {competition.registrationUrl && (
                        <a
                          href={competition.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-vgbf-green text-white text-center py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Anmäl dig
                        </a>
                      )}
                      {competition.resultsUrl && (
                        <a
                          href={competition.resultsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-vgbf-blue text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Se resultat
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
