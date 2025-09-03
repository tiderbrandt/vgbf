'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Club } from '@/types'

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [welcomingNewFilter, setWelcomingNewFilter] = useState(false)

  useEffect(() => {
    loadClubs()
  }, [])

  const loadClubs = async () => {
    try {
      const response = await fetch('/api/clubs')
      const data = await response.json()
      if (data.success) {
        setClubs(data.data)
      }
    } catch (error) {
      console.error('Error loading clubs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get unique locations for filter
  const locations = Array.from(new Set(clubs.map(club => club.city))).sort()

  // Filter clubs based on search and filters
  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLocation = locationFilter === 'all' || club.city === locationFilter
    const matchesWelcoming = !welcomingNewFilter || club.welcomesNewMembers
    
    return matchesSearch && matchesLocation && matchesWelcoming
  })

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vgbf-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Laddar klubbar...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="bg-vgbf-blue text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Klubbar i Västra Götaland</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Upptäck bågskytteklubbar i vårt distrikt och hitta den som passar dig bäst
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Sök klubbar
                </label>
                <input
                  id="search"
                  type="text"
                  placeholder="Sök på namn, ort eller beskrivning..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Ort
                </label>
                <select
                  id="location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                >
                  <option value="all">Alla orter</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={welcomingNewFilter}
                    onChange={(e) => setWelcomingNewFilter(e.target.checked)}
                    className="mr-2 text-vgbf-blue focus:ring-vgbf-blue"
                  />
                  <span className="text-sm text-gray-700">Välkomnar nya medlemmar</span>
                </label>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-vgbf-blue mb-2">{clubs.length}</div>
              <div className="text-gray-600">Klubbar totalt</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-vgbf-green mb-2">
                {clubs.filter(c => c.welcomesNewMembers).length}
              </div>
              <div className="text-gray-600">Välkomnar nya medlemmar</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-vgbf-gold mb-2">{locations.length}</div>
              <div className="text-gray-600">Orter representerade</div>
            </div>
          </div>

          {/* Clubs Grid */}
          {filteredClubs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏹</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Inga klubbar hittades</h3>
              <p className="text-gray-500">
                {searchTerm || locationFilter !== 'all' || welcomingNewFilter
                  ? 'Inga klubbar matchar dina sökkriterier. Prova att ändra filtren.'
                  : 'Det finns inga klubbar att visa just nu.'
                }
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClubs.map((club) => (
                <div key={club.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {club.imageUrl && (
                    <Image
                      src={club.imageUrl}
                      alt={club.imageAlt || club.name}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <Link href={`/klubbar/${club.id}`}>
                        <h3 className="text-xl font-bold text-vgbf-blue hover:text-vgbf-green transition-colors cursor-pointer">
                          {club.name}
                        </h3>
                      </Link>
                      {club.welcomesNewMembers && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Nya medlemmar
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">{club.description}</p>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">📍 Ort:</span>
                        {club.city}
                      </div>
                      
                      {club.established && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">📅 Grundad:</span>
                          {club.established}
                        </div>
                      )}
                      
                      {club.memberCount && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">👥 Medlemmar:</span>
                          {club.memberCount}
                        </div>
                      )}
                      
                      {club.membershipFee && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">💰 Medlemsavgift:</span>
                          {club.membershipFee}
                        </div>
                      )}
                    </div>

                    {/* Activities */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {club.activities.slice(0, 3).map((activity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {activity}
                          </span>
                        ))}
                        {club.activities.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{club.activities.length - 3} till
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex gap-2">
                      <Link
                        href={`/klubbar/${club.id}`}
                        className="flex-1 bg-vgbf-blue text-white text-center py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Läs mer
                      </Link>
                      
                      <a
                        href={`mailto:${club.email}`}
                        className="flex-1 bg-vgbf-green text-white text-center py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Kontakt
                      </a>
                      
                      {club.website && (
                        <a
                          href={club.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-500 text-white py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                          🌐
                        </a>
                      )}
                      
                      {club.phone && (
                        <a
                          href={`tel:${club.phone}`}
                          className="bg-gray-500 text-white py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                          📞
                        </a>
                      )}
                    </div>

                    {/* Social Media */}
                    {(club.facebook || club.instagram) && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                        {club.facebook && (
                          <a
                            href={club.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Facebook
                          </a>
                        )}
                        {club.instagram && (
                          <a
                            href={`https://instagram.com/${club.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-700 text-sm"
                          >
                            {club.instagram}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-12 bg-vgbf-blue text-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Vill din klubb synas här?</h2>
            <p className="text-blue-100 mb-6">
              Kontakta Västra Götalands Bågskytteförbund för att lägga till eller uppdatera klubbinformation.
            </p>
            <a
              href="mailto:info@vgbf.se"
              className="bg-white text-vgbf-blue px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Kontakta oss
            </a>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
