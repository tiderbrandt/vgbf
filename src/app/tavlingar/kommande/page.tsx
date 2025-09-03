'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Competition } from '@/types'

export default function UpcomingCompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<'all' | Competition['category']>('all')

  useEffect(() => {
    loadCompetitions()
  }, [])

  const loadCompetitions = async () => {
    try {
      const response = await fetch('/api/competitions')
      const data = await response.json()
      if (data.success) {
        // Filter only upcoming competitions
        const upcomingCompetitions = data.data.filter((comp: Competition) => comp.status === 'upcoming')
        setCompetitions(upcomingCompetitions)
      }
    } catch (error) {
      console.error('Error loading competitions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompetitions = competitions.filter(competition => {
    return categoryFilter === 'all' || competition.category === categoryFilter
  })

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
            <p className="mt-4 text-gray-600">Laddar kommande tävlingar...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kommande tävlingar</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Alla tävlingar som kommer att äga rum framöver
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Navigation */}
          <div className="mb-8">
            <nav className="flex gap-4">
              <Link
                href="/tavlingar"
                className="text-vgbf-blue hover:text-vgbf-green font-medium"
              >
                ← Tillbaka till alla tävlingar
              </Link>
            </nav>
          </div>

          {/* Category Filter */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="font-medium text-gray-700">Filtrera efter kategori:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
                className="px-3 py-2 rounded border border-gray-300"
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

          {/* Competitions Grid */}
          {filteredCompetitions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-blue-400 text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Inga kommande tävlingar</h3>
              <p className="text-gray-500">
                {categoryFilter === 'all' 
                  ? 'Det finns inga kommande tävlingar att visa just nu.'
                  : 'Inga kommande tävlingar matchar den valda kategorin.'
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
                      <h3 className="text-xl font-bold text-vgbf-blue">{competition.title}</h3>
                      <div className="flex flex-col gap-1">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          Kommande
                        </span>
                        {getCategoryBadge(competition.category)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">{competition.description}</p>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">📅 Datum:</span>
                        {new Date(competition.date).toLocaleDateString('sv-SE')}
                      </div>
                      {competition.registrationDeadline && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">⏰ Anmälan senast:</span>
                          {new Date(competition.registrationDeadline).toLocaleDateString('sv-SE')}
                        </div>
                      )}
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
                      {competition.maxParticipants && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">👤 Max deltagare:</span>
                          {competition.maxParticipants}
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
                      {competition.contactEmail && (
                        <a
                          href={`mailto:${competition.contactEmail}`}
                          className="flex-1 bg-vgbf-blue text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Kontakt
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
