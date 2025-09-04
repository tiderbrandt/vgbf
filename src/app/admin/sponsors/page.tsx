'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Sponsor } from '@/types'
import { useToast } from '@/contexts/ToastContext'

export default function SponsorsAdminPage() {
  const { success, error } = useToast()
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSponsors()
  }, [])

  const loadSponsors = async () => {
    try {
      const response = await fetch('/api/sponsors')
      const data = await response.json()
      if (data.success) {
        setSponsors(data.data)
      }
    } catch (error) {
      console.error('Error loading sponsors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (sponsor: Sponsor) => {
    if (!confirm(`Är du säker på att du vill ta bort "${sponsor.name}"?`)) return
    
    try {
      const response = await fetch(`/api/sponsors?id=${sponsor.id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      if (data.success) {
        setSponsors(prev => prev.filter(item => item.id !== sponsor.id))
        success('Sponsor borttagen!', `"${sponsor.name}" har tagits bort.`)
      } else {
        error('Fel vid borttagning', data.error || 'Ett oväntat fel inträffade.')
      }
    } catch (err) {
      console.error('Error deleting sponsor:', err)
      error('Fel vid borttagning', 'Ett oväntat fel inträffade.')
    }
  }

  const toggleActive = async (sponsor: Sponsor) => {
    try {
      const response = await fetch('/api/sponsors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...sponsor,
          isActive: !sponsor.isActive
        }),
      })
      
      const data = await response.json()
      if (data.success) {
        setSponsors(prev => prev.map(s => 
          s.id === sponsor.id ? { ...s, isActive: !s.isActive } : s
        ))
        success(
          sponsor.isActive ? 'Sponsor inaktiverad' : 'Sponsor aktiverad',
          `"${sponsor.name}" är nu ${!sponsor.isActive ? 'aktiv' : 'inaktiv'}.`
        )
      } else {
        error('Fel vid uppdatering', data.error || 'Ett oväntat fel inträffade.')
      }
    } catch (err) {
      console.error('Error updating sponsor:', err)
      error('Fel vid uppdatering', 'Ett oväntat fel inträffade.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vgbf-blue mx-auto mb-4"></div>
            <p>Laddar sponsorer...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-vgbf-blue">Hantera Sponsorer</h1>
              <p className="text-gray-600 mt-2">Lägg till, redigera och hantera sponsorer</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin/sponsors/new"
                className="bg-vgbf-blue text-white px-6 py-3 rounded-lg hover:bg-vgbf-green transition-colors font-semibold"
              >
                Lägg till ny sponsor
              </Link>
              <Link
                href="/admin"
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Tillbaka till admin
              </Link>
            </div>
          </div>

          {/* Sponsors Grid */}
          {sponsors.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsors.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                    sponsor.isActive ? 'border-green-500' : 'border-gray-400'
                  }`}
                >
                  {/* Sponsor Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {sponsor.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sponsor.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {sponsor.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Prioritet: {sponsor.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Logo */}
                  {sponsor.logoUrl && (
                    <div className="mb-4 flex justify-center">
                      <div className="relative w-24 h-24">
                        <Image
                          src={sponsor.logoUrl}
                          alt={sponsor.logoAlt || sponsor.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {sponsor.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {sponsor.description}
                    </p>
                  )}

                  {/* Website */}
                  {sponsor.website && (
                    <div className="mb-4">
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-vgbf-blue hover:text-vgbf-green text-sm break-all"
                      >
                        {sponsor.website}
                      </a>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="text-xs text-gray-500 mb-4">
                    <div>Tillagd: {new Date(sponsor.addedDate).toLocaleDateString('sv-SE')}</div>
                    <div>Uppdaterad: {new Date(sponsor.updatedAt).toLocaleDateString('sv-SE')}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/sponsors/${sponsor.id}/edit`}
                      className="flex-1 bg-vgbf-blue text-white px-3 py-2 rounded-lg hover:bg-vgbf-green transition-colors text-sm text-center"
                    >
                      Redigera
                    </Link>
                    <button
                      onClick={() => toggleActive(sponsor)}
                      className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                        sponsor.isActive
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {sponsor.isActive ? 'Inaktivera' : 'Aktivera'}
                    </button>
                    <button
                      onClick={() => handleDelete(sponsor)}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Ta bort
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Inga sponsorer ännu</h3>
              <p className="text-gray-500 mb-6">Kom igång genom att lägga till din första sponsor.</p>
              <Link
                href="/admin/sponsors/new"
                className="bg-vgbf-blue text-white px-6 py-3 rounded-lg hover:bg-vgbf-green transition-colors font-semibold"
              >
                Lägg till ny sponsor
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
