'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { NewsArticle, Competition, Club, Sponsor, BoardMember } from '@/types'
import { useToast } from '@/contexts/ToastContext'
import { authenticatedApiCall } from '@/lib/api'

// Icons (you can replace these with react-icons if you prefer)
const Icons = {
  News: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  Competitions: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  Clubs: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Records: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Sponsors: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Board: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  Contact: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Activity: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [news, setNews] = useState<NewsArticle[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Derived stats
  const stats = {
    totalNews: news.length,
    featuredNews: news.filter(n => n.featured).length,
    recentNews: news.filter(n => new Date(n.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    upcomingCompetitions: competitions.filter(c => c.status === 'upcoming').length,
    ongoingCompetitions: competitions.filter(c => c.status === 'ongoing').length,
    totalCompetitions: competitions.length,
    activeClubs: clubs.filter(c => c.welcomesNewMembers).length,
    totalClubs: clubs.length,
    totalSponsors: sponsors.length,
    totalBoardMembers: boardMembers.length
  }

  // Load news on component mount
  useEffect(() => {
    loadNews()
    loadCompetitions()
    loadClubs()
    loadSponsors()
    loadBoardMembers()
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

  const loadSponsors = async () => {
    try {
      const response = await fetch('/api/sponsors')
      const data = await response.json()
      if (data.success) {
        setSponsors(data.data)
      }
    } catch (error) {
      console.error('Error loading sponsors:', error)
    }
  }

  const loadBoardMembers = async () => {
    try {
      const response = await fetch('/api/board')
      const data = await response.json()
      if (data.success) {
        // Flatten all board members from all categories
        const allMembers = Object.values(data.data).flat() as BoardMember[]
        setBoardMembers(allMembers)
      }
    } catch (error) {
      console.error('Error loading board members:', error)
    }
  }

  const handleDeleteNews = async (article: NewsArticle) => {
    if (!confirm('Är du säker på att du vill ta bort denna nyhet?')) return
    
    try {
      const response = await authenticatedApiCall(`/api/news?id=${article.id}`, {
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
      const response = await authenticatedApiCall('/api/competitions', {
        method: 'DELETE',
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
      const response = await authenticatedApiCall('/api/clubs', {
        method: 'DELETE',
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-vgbf-blue mb-2">Administration</h1>
              <p className="text-gray-600">Hantera innehåll och konfiguration för VGBF</p>
            </div>
            <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icons.Search />
                </div>
                <input
                  type="text"
                  placeholder="Sök..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-vgbf-blue focus:border-vgbf-blue"
                />
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vgbf-blue">
                <Icons.Settings />
                <span className="ml-2 hidden sm:block">Inställningar</span>
              </button>
            </div>
          </div>

          {/* Dashboard Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-vgbf-blue">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icons.News />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Nyheter</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalNews}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.featuredNews} viktiga, {stats.recentNews} nya denna vecka
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-vgbf-green">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icons.Competitions />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tävlingar</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalCompetitions}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.upcomingCompetitions} kommande, {stats.ongoingCompetitions} pågående
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-vgbf-gold">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icons.Clubs />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Klubbar</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalClubs}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.activeClubs} tar emot nya medlemmar
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icons.Activity />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Totalt</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalSponsors + stats.totalBoardMembers}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {stats.totalSponsors} sponsorer, {stats.totalBoardMembers} styrelsemedlemmar
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Actions */}
            <div className="lg:col-span-2">
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Enhanced Card: Nyheter */}
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 p-3 bg-vgbf-blue bg-opacity-10 rounded-lg">
                        <Icons.News />
                      </div>
                      <div className="ml-4">
                        <h2 className="text-xl font-bold text-vgbf-blue">Nyheter</h2>
                        <p className="text-sm text-gray-600">Hantera nyheter och meddelanden</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-vgbf-blue">{stats.totalNews}</div>
                        <div className="text-xs text-gray-500">Totalt</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.featuredNews}</div>
                        <div className="text-xs text-gray-500">Viktiga</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href="/admin/news/new"
                        className="bg-vgbf-blue text-white px-4 py-2 rounded-lg hover:bg-vgbf-green transition-colors font-semibold text-sm text-center"
                      >
                        Ny nyhet
                      </Link>
                      <Link
                        href="/admin/news"
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm text-center"
                      >
                        Hantera alla ({stats.totalNews})
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Enhanced Card: Tävlingar */}
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 p-3 bg-vgbf-green bg-opacity-10 rounded-lg">
                        <Icons.Competitions />
                      </div>
                      <div className="ml-4">
                        <h2 className="text-xl font-bold text-vgbf-blue">Tävlingar</h2>
                        <p className="text-sm text-gray-600">Hantera tävlingar och evenemang</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-vgbf-green">{stats.upcomingCompetitions}</div>
                        <div className="text-xs text-gray-500">Kommande</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.ongoingCompetitions}</div>
                        <div className="text-xs text-gray-500">Pågående</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href="/admin/competitions/new"
                        className="bg-vgbf-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm text-center"
                      >
                        Ny tävling
                      </Link>
                      <Link
                        href="/admin/competitions"
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm text-center"
                      >
                        Hantera alla ({stats.totalCompetitions})
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Enhanced Card: Klubbar */}
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 p-3 bg-vgbf-gold bg-opacity-20 rounded-lg">
                        <Icons.Clubs />
                      </div>
                      <div className="ml-4">
                        <h2 className="text-xl font-bold text-vgbf-blue">Klubbar</h2>
                        <p className="text-sm text-gray-600">Hantera klubbar och föreningar</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-vgbf-gold">{stats.totalClubs}</div>
                        <div className="text-xs text-gray-500">Totalt</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.activeClubs}</div>
                        <div className="text-xs text-gray-500">Öppna</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href="/admin/clubs/new"
                        className="bg-vgbf-gold text-vgbf-blue px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors font-semibold text-sm text-center"
                      >
                        Ny klubb
                      </Link>
                      <Link
                        href="/admin/clubs"
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm text-center"
                      >
                        Hantera alla ({stats.totalClubs})
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Enhanced Card: Distriktsrekord */}
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
                        <Icons.Records />
                      </div>
                      <div className="ml-4">
                        <h2 className="text-xl font-bold text-vgbf-blue">Distriktsrekord</h2>
                        <p className="text-sm text-gray-600">Hantera distriktsrekord</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href="/admin/records/new"
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm text-center"
                      >
                        Nytt rekord
                      </Link>
                      <Link
                        href="/admin/records"
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm text-center"
                      >
                        Hantera alla
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Secondary Actions & Quick Links */}
            <div className="space-y-6">
              {/* Quick Links */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-vgbf-blue mb-4">Snabblänkar</h3>
                <div className="space-y-3">
                  <Link
                    href="/admin/calendar"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Icons.Calendar />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Kalender</div>
                      <div className="text-xs text-gray-500">Hantera evenemang</div>
                    </div>
                  </Link>

                  <Link
                    href="/admin/sponsors"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex-shrink-0 p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <Icons.Sponsors />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Sponsorer</div>
                      <div className="text-xs text-gray-500">{stats.totalSponsors} sponsorer</div>
                    </div>
                  </Link>

                  <Link
                    href="/admin/board"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex-shrink-0 p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                      <Icons.Board />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Styrelsen</div>
                      <div className="text-xs text-gray-500">{stats.totalBoardMembers} medlemmar</div>
                    </div>
                  </Link>

                  <Link
                    href="/admin/contact"
                    className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Icons.Contact />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">Kontakt</div>
                      <div className="text-xs text-gray-500">Kontaktuppgifter & FAQ</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-vgbf-blue mb-4">Senaste aktivitet</h3>
                <div className="space-y-3">
                  {news.slice(0, 3).map((article) => (
                    <div key={article.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-vgbf-blue rounded-full mt-2"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {article.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(article.date).toLocaleDateString('sv-SE')}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {competitions.slice(0, 2).map((competition) => (
                    <div key={competition.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-vgbf-green rounded-full mt-2"></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {competition.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(competition.date).toLocaleDateString('sv-SE')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Data Tables Section */}
          <div className="mt-12 space-y-8">
            {/* Recent News Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-vgbf-blue">Senaste nyheter</h3>
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/admin/news/new"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-vgbf-blue hover:bg-vgbf-green transition-colors"
                    >
                      Ny nyhet
                    </Link>
                    <Link
                      href="/admin/news"
                      className="text-vgbf-blue hover:text-vgbf-green font-medium text-sm"
                    >
                      Se alla →
                    </Link>
                  </div>
                </div>
              </div>

              {news.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Artikel
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Datum
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
                        <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-start">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {article.title}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {article.excerpt.substring(0, 80)}...
                                </p>
                                {article.author && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    av {article.author}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(article.date).toLocaleDateString('sv-SE')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {article.featured && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Viktigt
                                </span>
                              )}
                              {article.imageUrl && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Bild
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => router.push(`/admin/news/${article.id}/edit`)}
                                className="text-vgbf-blue hover:text-vgbf-green transition-colors"
                                title="Redigera"
                              >
                                Redigera
                              </button>
                              <button
                                onClick={() => window.open(`/nyheter/${article.slug}`, '_blank')}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Visa"
                              >
                                Visa
                              </button>
                              <button
                                onClick={() => handleDeleteNews(article)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Ta bort"
                              >
                                Ta bort
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icons.News />
                  <p className="text-gray-500 mb-4 mt-2">Inga nyheter att visa.</p>
                  <Link
                    href="/admin/news/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-vgbf-blue hover:bg-vgbf-green transition-colors"
                  >
                    Skapa din första nyhet
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Competitions Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-vgbf-blue">Senaste tävlingar</h3>
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/admin/competitions/new"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-vgbf-green hover:bg-green-700 transition-colors"
                    >
                      Ny tävling
                    </Link>
                    <Link
                      href="/admin/competitions"
                      className="text-vgbf-blue hover:text-vgbf-green font-medium text-sm"
                    >
                      Se alla →
                    </Link>
                  </div>
                </div>
              </div>

              {competitions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tävling
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
                        <tr key={competition.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {competition.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {competition.organizer}
                              </div>
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
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/admin/competitions/${competition.id}/edit`}
                                className="text-vgbf-blue hover:text-vgbf-green transition-colors"
                              >
                                Redigera
                              </Link>
                              <button
                                onClick={() => handleDeleteCompetition(competition)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                              >
                                Ta bort
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icons.Competitions />
                  <p className="text-gray-500 mb-4 mt-2">Inga tävlingar att visa.</p>
                  <Link
                    href="/admin/competitions/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-vgbf-green hover:bg-green-700 transition-colors"
                  >
                    Skapa din första tävling
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Clubs Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-vgbf-blue">Klubbar</h3>
                  <div className="flex items-center space-x-3">
                    <Link
                      href="/admin/clubs/new"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-vgbf-blue bg-vgbf-gold hover:bg-yellow-300 transition-colors"
                    >
                      Ny klubb
                    </Link>
                    <Link
                      href="/admin/clubs"
                      className="text-vgbf-blue hover:text-vgbf-green font-medium text-sm"
                    >
                      Se alla →
                    </Link>
                  </div>
                </div>
              </div>

              {clubs.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
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
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Åtgärder
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clubs.slice(0, 5).map((club) => (
                        <tr key={club.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {club.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Grundad {club.established}
                              </div>
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
                              {club.welcomesNewMembers ? 'Öppet för nya medlemmar' : 'Stängt för nya medlemmar'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/admin/clubs/${club.id}/edit`}
                                className="text-vgbf-blue hover:text-vgbf-green transition-colors"
                              >
                                Redigera
                              </Link>
                              <button
                                onClick={() => window.open(`/klubbar/${club.id}`, '_blank')}
                                className="text-green-600 hover:text-green-900 transition-colors"
                              >
                                Visa
                              </button>
                              <button
                                onClick={() => handleDeleteClub(club)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                              >
                                Ta bort
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Icons.Clubs />
                  <p className="text-gray-500 mb-4 mt-2">Inga klubbar att visa.</p>
                  <Link
                    href="/admin/clubs/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-vgbf-blue bg-vgbf-gold hover:bg-yellow-300 transition-colors"
                  >
                    Lägg till din första klubb
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
