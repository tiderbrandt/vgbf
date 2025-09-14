'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdminBackButton from '@/components/AdminBackButton'
import { Club } from '@/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminClubsPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterLocation, setFilterLocation] = useState('')

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

  const handleDeleteClub = async (club: Club) => {
    if (!confirm(`Är du säker på att du vill ta bort "${club.name}"?`)) return
    
    try {
      const response = await fetch('/api/clubs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: club.id }),
      })
      
      const data = await response.json()
      if (data.success) {
        setClubs(prev => prev.filter(item => item.id !== club.id))
        success('Klubb borttagen!', `${club.name} har tagits bort från systemet.`)
      } else {
        error('Fel vid borttagning', data.error || 'Ett oväntat fel inträffade.')
      }
    } catch (err) {
      console.error('Error deleting club:', err)
      error('Fel vid borttagning', 'Ett oväntat fel inträffade vid borttagning av klubben.')
    }
  }

  // Filter clubs based on search term and location
  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = !filterLocation || club.location.toLowerCase().includes(filterLocation.toLowerCase())
    return matchesSearch && matchesLocation
  })

  // Get unique locations for filter
  const locations = Array.from(new Set(clubs.map(club => club.location))).sort()

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p>Laddar klubbar...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-vgbf-blue">Hantera klubbar</h1>
              <p className="text-gray-600 mt-2">Administrera klubbar och föreningar</p>
            </div>
            <div className="flex gap-4">
              <AdminBackButton />
              <Link
                href="/admin/clubs/new"
                className="bg-vgbf-gold text-vgbf-blue px-6 py-2 rounded-lg hover:bg-yellow-300 transition-colors font-semibold"
              >
                + Ny klubb
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Sök klubbar
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Sök efter namn, beskrivning eller plats..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrera efter plats
                </label>
                <select
                  id="location"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                >
                  <option value="">Alla platser</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-vgbf-blue">{clubs.length}</div>
                <div className="text-sm text-gray-600">Totalt klubbar</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-vgbf-green">{clubs.filter(c => c.welcomesNewMembers).length}</div>
                <div className="text-sm text-gray-600">Tar emot nya medlemmar</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-vgbf-gold">{locations.length}</div>
                <div className="text-sm text-gray-600">Olika platser</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-700">{filteredClubs.length}</div>
                <div className="text-sm text-gray-600">Visar resultat</div>
              </div>
            </div>
          </div>

          {/* Clubs Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klubb
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kontakt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medlemskap
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aktiviteter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Åtgärder
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClubs.map((club) => (
                    <tr key={club.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {club.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Grundad {club.established || 'okänt år'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {club.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{club.email}</div>
                        {club.phone && <div className="text-xs">{club.phone}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          club.welcomesNewMembers ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {club.welcomesNewMembers ? 'Öppet' : 'Stängt'}
                        </span>
                        {club.membershipFee && (
                          <div className="text-xs text-gray-500 mt-1">{club.membershipFee}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {club.activities.slice(0, 3).map((activity, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {activity}
                            </span>
                          ))}
                          {club.activities.length > 3 && (
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{club.activities.length - 3} fler
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          href={`/admin/clubs/${club.id}/edit`}
                          className="text-vgbf-blue hover:text-vgbf-green"
                        >
                          Redigera
                        </Link>
                        <button
                          onClick={() => window.open(`/klubbar/${club.id}`, '_blank')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Visa
                        </button>
                        <button
                          onClick={() => handleDeleteClub(club)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Ta bort
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredClubs.length === 0 && clubs.length > 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Inga klubbar matchar dina sökkriterier.</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterLocation('')
                }}
                className="text-vgbf-blue hover:text-vgbf-green font-medium"
              >
                Rensa filter
              </button>
            </div>
          )}

          {clubs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Inga klubbar att visa.</p>
              <Link
                href="/admin/clubs/new"
                className="bg-vgbf-gold text-vgbf-blue px-6 py-3 rounded-lg hover:bg-yellow-300 transition-colors"
              >
                Lägg till din första klubb
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
