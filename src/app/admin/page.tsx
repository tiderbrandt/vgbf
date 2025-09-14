 'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { NewsArticle, Competition, Club, Sponsor, BoardMember } from '@/types'
import { useToast } from '@/contexts/ToastContext'
import { authenticatedApiCall } from '@/lib/api'
import Icons from '@/components/admin-icons-exports'
import AdminToolbar from '@/components/AdminToolbar'

export default function AdminDashboard() {
  const router = useRouter()
  const { success, error } = useToast()
  const [news, setNews] = useState<NewsArticle[]>([])
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dataError, setDataError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Enhanced stats with more insights
  const stats = useMemo(() => ({
    totalNews: news.length,
    featuredNews: news.filter(n => n.featured).length,
    recentNews: news.filter(n => new Date(n.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    draftNews: news.filter(n => !n.featured).length, // Use featured as a proxy for published status
    upcomingCompetitions: competitions.filter(c => c.status === 'upcoming').length,
    ongoingCompetitions: competitions.filter(c => c.status === 'ongoing').length,
    completedCompetitions: competitions.filter(c => c.status === 'completed').length,
    totalCompetitions: competitions.length,
    activeClubs: clubs.filter(c => c.welcomesNewMembers).length,
    totalClubs: clubs.length,
    totalSponsors: sponsors.length,
    totalBoardMembers: boardMembers.length
  }), [news, competitions, clubs, sponsors, boardMembers])
  
  // Debug logging for stats
  useEffect(() => {
    if (!loading) {
      console.log('📈 Performance stats calculated:', stats)
    }
  }, [loading, stats])

  // Recent activity (last 5 items)
  const recentActivity = useMemo(() => [
    ...news.slice(0, 3).map(item => ({
      type: 'news',
      title: item.title,
      date: item.date,
      status: item.featured ? 'viktig' : 'vanlig'
    })),
    ...competitions.slice(0, 2).map(item => ({
      type: 'competition',
      title: item.title,
      date: item.date,
      status: item.status
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5), [news, competitions])

  // Load data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      setDataError(null)
      console.log('🔍 Starting data initialization...')
      try {
        await Promise.all([
          loadNews(),
          loadCompetitions(),
          loadClubs(),
          loadSponsors(),
          loadBoardMembers()
        ])
        console.log('📊 Data loaded successfully:', {
          news: news.length,
          competitions: competitions.length,
          clubs: clubs.length,
          sponsors: sponsors.length,
          boardMembers: boardMembers.length
        })
        setRetryCount(0)
      } catch (error) {
        console.error('❌ Error loading data:', error)
        setDataError('Fel vid laddning av data. Försöker igen...')
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, 2000)
        }
      } finally {
        setLoading(false)
      }
    }
    
    initializeData()
  }, [retryCount])

  const loadNews = async () => {
    try {
      console.log('📰 Loading news...')
      const response = await fetch('/api/news')
      const data = await response.json()
      console.log('📰 News API response:', { success: data.success, count: data.data?.length })
      if (data.success) {
        setNews(data.data)
      }
    } catch (error) {
      console.error('❌ Error loading news:', error)
    }
  }

  const loadCompetitions = async () => {
    try {
      console.log('🏆 Loading competitions...')
      const response = await fetch('/api/competitions')
      const data = await response.json()
      console.log('🏆 Competitions API response:', { success: data.success, count: data.data?.length })
      if (data.success) {
        setCompetitions(data.data)
      }
    } catch (error) {
      console.error('❌ Error loading competitions:', error)
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
        setBoardMembers(data.data)
      }
    } catch (error) {
      console.error('Error loading board members:', error)
    }
  }



  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Loading Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-80 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>
          </div>
        </div>
        
        {/* Loading Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-6">
            <div className="flex space-x-8 py-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-8">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Laddar administrationsdata</h2>
            <p className="text-gray-600">Hämtar den senaste informationen...</p>
          </div>
        </div>
        
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Enhanced Admin Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <span>VGBF</span>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-900 font-medium">Administration</span>
          </nav>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Administrationscentral
              </h1>
              <p className="text-gray-600">
                Hantera allt innehåll för Västra Götalands Bågskytteförbund
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {/* Notification Bell */}
                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a5.003 5.003 0 001.5-3.5c0-2.76-2.24-5-5-5s-5 2.24-5 5c0 1.316.508 2.514 1.343 3.414L15 17z" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                {/* User Avatar */}
                <div className="flex items-center space-x-3 px-3 py-2 bg-gray-100 rounded-lg">
                  <div className="w-8 h-8 bg-vgbf-blue rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">A</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">Admin</p>
                    <p className="text-xs text-gray-500">Superadministratör</p>
                  </div>
                </div>
              </div>
              
              <AdminToolbar searchValue={searchTerm} onSearchChange={setSearchTerm} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Secondary Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-8">
            <Link
              href="/admin"
              className="inline-flex items-center px-1 pt-1 pb-4 border-b-2 border-blue-500 text-sm font-medium text-blue-600"
            >
              <Icons.Activity />
              <span className="ml-2">Dashboard</span>
            </Link>
            <Link
              href="/admin/news"
              className="inline-flex items-center px-1 pt-1 pb-4 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
            >
              <Icons.News />
              <span className="ml-2">Nyheter</span>
            </Link>
            <Link
              href="/admin/competitions"
              className="inline-flex items-center px-1 pt-1 pb-4 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
            >
              <Icons.Competitions />
              <span className="ml-2">Tävlingar</span>
            </Link>
            <Link
              href="/admin/clubs"
              className="inline-flex items-center px-1 pt-1 pb-4 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
            >
              <Icons.Clubs />
              <span className="ml-2">Klubbar</span>
            </Link>
            <Link
              href="/admin/records"
              className="inline-flex items-center px-1 pt-1 pb-4 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
            >
              <Icons.Records />
              <span className="ml-2">Rekord</span>
            </Link>
            <Link
              href="/admin/settings"
              className="inline-flex items-center px-1 pt-1 pb-4 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
            >
              <Icons.Settings />
              <span className="ml-2">Inställningar</span>
            </Link>
          </nav>
        </div>
      </div>
      
      <div className="container mx-auto px-6 py-8">

        {/* Enhanced Statistics Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Översikt</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Nyheter</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalNews}</p>
                  <div className="flex items-center mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      +{stats.recentNews} i veckan
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Icons.News />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Tävlingar</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCompetitions}</p>
                  <div className="flex items-center mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      {stats.upcomingCompetitions} kommande
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Icons.Competitions />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Klubbar</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClubs}</p>
                  <div className="flex items-center mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      {stats.activeClubs} öppna
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <Icons.Clubs />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Rekord</p>
                  <p className="text-2xl font-bold text-gray-900">19</p>
                  <div className="flex items-center mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      Distriktsrekord
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Icons.Records />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Sponsorer</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSponsors}</p>
                  <div className="flex items-center mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Aktiva partners
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <Icons.Sponsors />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Styrelse</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBoardMembers}</p>
                  <div className="flex items-center mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      Medlemmar
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Icons.Board />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Kalender</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                  <div className="flex items-center mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                      Evenemang
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <Icons.Calendar />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Primary Management Modules */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Innehållshantering</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* News Management */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-50 rounded-lg mr-3">
                          <Icons.News />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Nyheter</h3>
                          <p className="text-sm text-gray-600">Hantera nyheter & meddelanden</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6 py-4 px-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{stats.totalNews}</div>
                        <div className="text-xs text-gray-600 mt-1">Totalt</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">{stats.featuredNews}</div>
                        <div className="text-xs text-gray-600 mt-1">Viktiga</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-orange-600">{stats.draftNews}</div>
                        <div className="text-xs text-gray-600 mt-1">Övriga</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Link
                        href="/admin/news/new"
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm text-center block"
                      >
                        Skapa ny nyhet
                      </Link>
                      <Link
                        href="/admin/news"
                        className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm text-center block"
                      >
                        Hantera alla ({stats.totalNews})
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Competition Management */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-50 rounded-lg mr-3">
                          <Icons.Competitions />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Tävlingar</h3>
                          <p className="text-sm text-gray-600">Hantera tävlingar & evenemang</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6 py-4 px-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">{stats.upcomingCompetitions}</div>
                        <div className="text-xs text-gray-600 mt-1">Kommande</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{stats.ongoingCompetitions}</div>
                        <div className="text-xs text-gray-600 mt-1">Pågående</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-600">{stats.completedCompetitions}</div>
                        <div className="text-xs text-gray-600 mt-1">Avslutade</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Link
                        href="/admin/competitions/new"
                        className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm text-center block"
                      >
                        Skapa ny tävling
                      </Link>
                      <Link
                        href="/admin/competitions"
                        className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm text-center block"
                      >
                        Hantera alla ({stats.totalCompetitions})
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Management Modules */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Organisationshantering</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Clubs Management */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-amber-50 rounded-lg mr-3">
                      <Icons.Clubs />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Klubbar</h3>
                      <p className="text-sm text-gray-600">{stats.totalClubs} registrerade</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Link
                      href="/admin/clubs/new"
                      className="w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm text-center block"
                    >
                      Lägg till klubb
                    </Link>
                    <Link
                      href="/admin/clubs"
                      className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm text-center block"
                    >
                      Hantera alla
                    </Link>
                  </div>
                </div>

                {/* Records Management */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-purple-50 rounded-lg mr-3">
                      <Icons.Records />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Rekord</h3>
                      <p className="text-sm text-gray-600">Distriktsrekord</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link
                      href="/admin/records/new"
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm text-center block"
                    >
                      Nytt rekord
                    </Link>
                    <Link
                      href="/admin/records"
                      className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm text-center block"
                    >
                      Hantera alla
                    </Link>
                  </div>
                </div>

                {/* Calendar Management */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                      <Icons.Calendar />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Kalender</h3>
                      <p className="text-sm text-gray-600">Evenemang</p>
                    </div>
                  </div>
                  
                  <Link
                    href="/admin/calendar"
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm text-center block"
                  >
                    Hantera kalender
                  </Link>
                </div>
              </div>
            </div>

            {/* Additional Management */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Webbplatshantering</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Sponsors Management */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-red-50 rounded-lg mr-3">
                      <Icons.Sponsors />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Sponsorer</h3>
                      <p className="text-sm text-gray-600">{stats.totalSponsors} aktiva partners</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Link
                      href="/admin/sponsors/new"
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm text-center block"
                    >
                      Lägg till sponsor
                    </Link>
                    <Link
                      href="/admin/sponsors"
                      className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm text-center block"
                    >
                      Hantera alla
                    </Link>
                  </div>
                </div>

                {/* Board Management */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-gray-50 rounded-lg mr-3">
                      <Icons.Board />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Styrelse</h3>
                      <p className="text-sm text-gray-600">{stats.totalBoardMembers} medlemmar</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Link
                      href="/admin/board"
                      className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm text-center block"
                    >
                      Hantera styrelse
                    </Link>
                    <Link
                      href="/admin/contact"
                      className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm text-center block"
                    >
                      Kontaktinfo
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Dashboard Insights */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icons.Activity />
                    <h3 className="text-lg font-semibold text-gray-900 ml-2">Senaste aktivitet</h3>
                  </div>
                  <span className="text-xs text-gray-500">Senaste 7 dagarna</span>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        item.type === 'news' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {item.type === 'news' ? <Icons.News /> : <Icons.Competitions />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {new Date(item.date).toLocaleDateString('sv-SE')}
                          </p>
                          <span className="text-gray-300">•</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            item.status === 'viktig' ? 'bg-orange-100 text-orange-800' :
                            item.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                            item.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <div className="text-center py-8">
                      <Icons.Activity />
                      <p className="text-sm text-gray-500 mt-2">
                        Ingen senaste aktivitet att visa
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <Icons.TrendingUp />
                  <h3 className="text-lg font-semibold text-gray-900 ml-2">Systemstatus</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">Databasstatus</span>
                    </div>
                    <span className="text-sm font-medium text-green-700">Aktiv</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">Bilduppladdning</span>
                    </div>
                    <span className="text-sm font-medium text-green-700">Fungerar</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">AI-bildgenerering</span>
                    </div>
                    <span className="text-sm font-medium text-green-700">Tillgänglig</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Icons.Clock />
                      <span className="text-sm font-medium text-gray-900 ml-2">Senaste backup</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">Idag</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-lg shadow-sm text-white">
              <div className="p-6 border-b border-slate-600">
                <h3 className="text-lg font-semibold">Prestationsöversikt</h3>
                <p className="text-slate-300 text-sm mt-1">Senaste månadens statistik</p>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="space-y-4">
                    <div className="animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-slate-600 rounded-lg mr-3"></div>
                          <div>
                            <div className="h-4 bg-slate-600 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-slate-600 rounded w-32"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-slate-600 rounded w-8"></div>
                      </div>
                    </div>
                    <div className="animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-slate-600 rounded-lg mr-3"></div>
                          <div>
                            <div className="h-4 bg-slate-600 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-slate-600 rounded w-32"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-slate-600 rounded w-8"></div>
                      </div>
                    </div>
                    <div className="animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-slate-600 rounded-lg mr-3"></div>
                          <div>
                            <div className="h-4 bg-slate-600 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-slate-600 rounded w-32"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-slate-600 rounded w-8"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-slate-600 rounded-lg mr-3">
                          <Icons.News />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Totalt innehåll</p>
                          <p className="text-xs text-slate-300">Alla typer av innehåll</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold">
                        {stats.totalNews + stats.totalCompetitions + stats.totalClubs}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-slate-600 rounded-lg mr-3">
                          <Icons.TrendingUp />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Aktivt innehåll</p>
                          <p className="text-xs text-slate-300">Publicerat och synligt</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold">
                        {stats.featuredNews + stats.upcomingCompetitions + stats.activeClubs}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-slate-600 rounded-lg mr-3">
                          <Icons.Board />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Organisation</p>
                          <p className="text-xs text-slate-300">Partners & styrelse</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold">
                        {stats.totalSponsors + stats.totalBoardMembers}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-slate-600 rounded-lg mr-3">
                          <Icons.Clock />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Senaste veckan</p>
                          <p className="text-xs text-slate-300">Nya nyheter</p>
                        </div>
                      </div>
                      <span className="text-xl font-bold">
                        {stats.recentNews}
                      </span>
                    </div>
                    
                    {/* Activity Progress Bar */}
                    <div className="pt-4 border-t border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Innehållsaktivitet</p>
                        <p className="text-xs text-slate-300">
                          {Math.round(((stats.featuredNews + stats.upcomingCompetitions + stats.activeClubs) / 
                            Math.max(stats.totalNews + stats.totalCompetitions + stats.totalClubs, 1)) * 100)}%
                        </p>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.round(((stats.featuredNews + stats.upcomingCompetitions + stats.activeClubs) / 
                              Math.max(stats.totalNews + stats.totalCompetitions + stats.totalClubs, 1)) * 100)}%`
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {stats.featuredNews + stats.upcomingCompetitions + stats.activeClubs > 0 
                          ? `${stats.featuredNews + stats.upcomingCompetitions + stats.activeClubs} av ${stats.totalNews + stats.totalCompetitions + stats.totalClubs} innehållselement är aktiva`
                          : stats.totalNews + stats.totalCompetitions + stats.totalClubs > 0
                            ? 'Inget innehåll är markerat som aktivt'
                            : 'Ingen data har laddats än'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Snabbåtgärder</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <Link
                    href="/admin/news/new"
                    className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <Icons.Plus />
                      <span className="text-sm font-medium text-gray-900 ml-2">Skapa nyhet</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  <Link
                    href="/admin/competitions/new"
                    className="flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <Icons.Plus />
                      <span className="text-sm font-medium text-gray-900 ml-2">Skapa tävling</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                  <Link
                    href="/admin/settings"
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <Icons.Settings />
                      <span className="text-sm font-medium text-gray-900 ml-2">Inställningar</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
