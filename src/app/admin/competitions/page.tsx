'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Competition } from '@/types'

export default function CompetitionsAdminPage() {
  const router = useRouter()
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadCompetitions()
  }, [])

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

  const deleteCompetition = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna tävling?')) {
      return
    }

    setDeleting(id)
    try {
      const response = await fetch('/api/competitions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      
      const data = await response.json()
      if (data.success) {
        setCompetitions(prev => prev.filter(comp => comp.id !== id))
        alert('Tävling borttagen!')
      } else {
        alert('Fel vid borttagning: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting competition:', error)
      alert('Fel vid borttagning av tävling')
    } finally {
      setDeleting(null)
    }
  }

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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
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
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-vgbf-blue">Hantera tävlingar</h1>
              <div className="flex gap-4">
                <Link
                  href="/admin/competitions/new"
                  className="bg-vgbf-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Ny tävling
                </Link>
                <Link
                  href="/admin"
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Tillbaka till admin
                </Link>
              </div>
            </div>

            {competitions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Inga tävlingar än</h3>
                <p className="text-gray-500 mb-6">Skapa din första tävling för att komma igång.</p>
                <Link
                  href="/admin/competitions/new"
                  className="bg-vgbf-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Skapa tävling
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Titel</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Datum</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Plats</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Kategori</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Arrangeör</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitions.map((competition) => (
                      <tr key={competition.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{competition.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {competition.description}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {new Date(competition.date).toLocaleDateString('sv-SE')}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {competition.location}
                        </td>
                        <td className="py-4 px-4">
                          {getCategoryBadge(competition.category)}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(competition.status)}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {competition.organizer}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/competitions/${competition.id}/edit`}
                              className="text-vgbf-blue hover:text-blue-700 font-medium text-sm"
                            >
                              Redigera
                            </Link>
                            <button
                              onClick={() => deleteCompetition(competition.id)}
                              disabled={deleting === competition.id}
                              className="text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                            >
                              {deleting === competition.id ? 'Tar bort...' : 'Ta bort'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
