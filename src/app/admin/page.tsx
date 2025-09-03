'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { NewsArticle, Competition, Club } from '@/types'
import { useToast } from '@/contexts/ToastContext'

export default function AdminPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [news, setNews] = useState<NewsArticle[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)

  // Load news on component mount
  useEffect(() => {
    loadNews()
    loadCompetitions()
    loadClubs()
  }, [])

  const loadNews = async () => {
    try {
      const response = await fetch('/api/news')
      const data = await response.json()
      if (data.success) {
        setNews(data.data)
      }
    } catch (error) {
      console.error('Error loading news:', error)
    }
  }

  const loadCompetitions = async () => {
    try {
      const response = await fetch('/api/competitions')
      const data = await response.json()
      if (data.success) {
        setCompetitions(data.data)
      }
    } catch (error) {
      console.error('Error loading competitions:', error)
    }
  }

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

  const handleDeleteNews = async (article: NewsArticle) => {
    if (!confirm('Är du säker på att du vill ta bort denna nyhet?')) return
    
    try {
      const response = await fetch(`/api/news?id=${article.id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      if (data.success) {
        setNews(prev => prev.filter(item => item.id !== article.id))
        success('Nyhet borttagen!', `"${article.title}" har tagits bort.`)
      } else {
        error('Fel vid borttagning', data.error || 'Ett oväntat fel inträffade.')
      }
    } catch (err) {
      console.error('Error deleting news:', err)
      error('Fel vid borttagning', 'Ett oväntat fel inträffade vid borttagning av nyheten.')
    }
  }

  const handleDeleteCompetition = async (competition: Competition) => {
    if (!confirm('Är du säker på att du vill ta bort denna tävling?')) return
    
    try {
      const response = await fetch('/api/competitions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: competition.id }),
      })
      
      const data = await response.json()
      if (data.success) {
        setCompetitions(prev => prev.filter(item => item.id !== competition.id))
        success('Tävling borttagen!', `"${competition.title}" har tagits bort.`)
      } else {
        error('Fel vid borttagning', data.error || 'Ett oväntat fel inträffade.')
      }
    } catch (err) {
      console.error('Error deleting competition:', err)
      error('Fel vid borttagning', 'Ett oväntat fel inträffade vid borttagning av tävlingen.')
    }
  }

  const handleDeleteClub = async (club: Club) => {
    if (!confirm('Är du säker på att du vill ta bort denna klubb?')) return
    
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
        success('Klubb borttagen!', `"${club.name}" har tagits bort.`)
      } else {
        error('Fel vid borttagning', data.error || 'Ett oväntat fel inträffade.')
      }
    } catch (err) {
      console.error('Error deleting club:', err)
      error('Fel vid borttagning', 'Ett oväntat fel inträffade vid borttagning av klubben.')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p>Laddar nyheter...</p>
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
            <h1 className="text-3xl font-bold text-vgbf-blue">Administration</h1>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-vgbf-blue mb-4">Nyheter</h2>
              <p className="text-gray-600 mb-4">Hantera nyheter och meddelanden</p>
              <div className="flex gap-3">
                <Link
                  href="/admin/news/new"
                  className="bg-vgbf-blue text-white px-4 py-2 rounded-lg hover:bg-vgbf-green transition-colors font-semibold text-sm"
                >
                  Ny nyhet
                </Link>
                <Link
                  href="/admin/news"
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
                >
                  Hantera alla
                </Link>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Totalt: {news.length} nyheter
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-vgbf-blue mb-4">Tävlingar</h2>
              <p className="text-gray-600 mb-4">Hantera tävlingar och evenemang</p>
              <div className="flex gap-3">
                <Link
                  href="/admin/competitions/new"
                  className="bg-vgbf-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                >
                  Ny tävling
                </Link>
                <Link
                  href="/admin/competitions"
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
                >
                  Hantera alla
                </Link>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Totalt: {competitions.length} tävlingar
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-vgbf-blue mb-4">Klubbar</h2>
              <p className="text-gray-600 mb-4">Hantera klubbar och föreningar</p>
              <div className="flex gap-3">
                <Link
                  href="/admin/clubs/new"
                  className="bg-vgbf-gold text-vgbf-blue px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors font-semibold text-sm"
                >
                  Ny klubb
                </Link>
                <Link
                  href="/admin/clubs"
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
                >
                  Hantera alla
                </Link>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Totalt: {clubs.length} klubbar
              </div>
            </div>
          </div>

          {/* Recent News */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-vgbf-blue">Senaste nyheter</h2>
              <Link
                href="/admin/news"
                className="text-vgbf-blue hover:text-vgbf-green font-medium"
              >
                Se alla →
              </Link>
            </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rubrik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Författare
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Åtgärder
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {news.slice(0, 5).map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {article.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {article.excerpt.substring(0, 60)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(article.date).toLocaleDateString('sv-SE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {article.author || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {article.featured && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Viktigt
                          </span>
                        )}
                        {article.imageUrl && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 ml-2">
                            Med bild
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => router.push(`/admin/news/${article.id}/edit`)}
                          className="text-vgbf-blue hover:text-vgbf-green"
                        >
                          Redigera
                        </button>
                        <button
                          onClick={() => window.open(`/nyheter/${article.slug}`, '_blank')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Visa
                        </button>
                        <button
                          onClick={() => handleDeleteNews(article)}
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

          {news.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Inga nyheter att visa.</p>
              <Link
                href="/admin/news/new"
                className="bg-vgbf-blue text-white px-6 py-3 rounded-lg hover:bg-vgbf-green transition-colors"
              >
                Skapa din första nyhet
              </Link>
            </div>
          )}
          </div>

          {/* Recent Competitions */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-vgbf-blue">Senaste tävlingar</h2>
              <Link
                href="/admin/competitions"
                className="text-vgbf-blue hover:text-vgbf-green font-medium"
              >
                Se alla →
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Titel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Datum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Åtgärder
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {competitions.slice(0, 5).map((competition) => (
                      <tr key={competition.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {competition.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {competition.organizer}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(competition.date).toLocaleDateString('sv-SE')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            competition.category === 'outdoor' ? 'bg-green-100 text-green-800' :
                            competition.category === 'indoor' ? 'bg-purple-100 text-purple-800' :
                            competition.category === '3d' ? 'bg-orange-100 text-orange-800' :
                            competition.category === 'field' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {competition.category === 'outdoor' ? 'Utomhus' :
                             competition.category === 'indoor' ? 'Inomhus' :
                             competition.category === '3d' ? '3D' :
                             competition.category === 'field' ? 'Fält' : 'Övrigt'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            competition.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                            competition.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {competition.status === 'upcoming' ? 'Kommande' :
                             competition.status === 'ongoing' ? 'Pågående' : 'Avslutad'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link
                            href={`/admin/competitions/${competition.id}/edit`}
                            className="text-vgbf-blue hover:text-vgbf-green"
                          >
                            Redigera
                          </Link>
                          <button
                            onClick={() => handleDeleteCompetition(competition)}
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

            {competitions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Inga tävlingar att visa.</p>
                <Link
                  href="/admin/competitions/new"
                  className="bg-vgbf-green text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Skapa din första tävling
                </Link>
              </div>
            )}
          </div>

          {/* Recent Clubs */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-vgbf-blue">Klubbar</h2>
              <Link
                href="/admin/clubs"
                className="text-vgbf-blue hover:text-vgbf-green font-medium"
              >
                Se alla →
              </Link>
            </div>

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
                        Åtgärder
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clubs.slice(0, 5).map((club) => (
                      <tr key={club.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {club.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Grundad {club.established}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {club.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {club.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            club.welcomesNewMembers ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {club.welcomesNewMembers ? 'Öppet' : 'Stängt'}
                          </span>
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
      </div>
      
      <Footer />
    </main>
  )
}
