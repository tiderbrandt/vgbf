'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { NewsArticle, Competition, Club, Sponsor, BoardMember } from '@/types'
import { useToast } from '@/contexts/ToastContext'
import { authenticatedApiCall } from '@/lib/api'



// Modern Icons
const Icons = {
  News: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  Competitions: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  Clubs: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Records: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Sponsors: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Board: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  Contact: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Activity: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  )
}

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

  // Enhanced stats with more insights
  const stats = {
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
  }

  // Recent activity (last 5 items)
  const recentActivity = [
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
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

  // Load data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          loadNews(),
          loadCompetitions(),
          loadClubs(),
          loadSponsors(),
          loadBoardMembers()
        ])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    initializeData()
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
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vgbf-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Laddar administrationsdata...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Administrationscentral
            </h1>
            <p className="text-lg text-gray-600">
              Hantera allt innehåll för Västra Götalands Bågskytteförbund
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icons.Search />
              </div>
              <input
                type="text"
                placeholder="Sök i administration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-vgbf-blue focus:border-transparent shadow-sm"
              />
            </div>
            <Link
              href="/admin/settings"
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vgbf-blue transition-all duration-200"
            >
              <Icons.Settings />
              <span className="ml-2">Inställningar</span>
            </Link>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Icons.News />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Nyheter</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalNews}</p>
                <p className="text-xs text-gray-500">
                  {stats.recentNews} nya i veckan
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Icons.Competitions />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Tävlingar</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCompetitions}</p>
                <p className="text-xs text-gray-500">
                  {stats.upcomingCompetitions} kommande
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Icons.Clubs />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Klubbar</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalClubs}</p>
                <p className="text-xs text-gray-500">
                  {stats.activeClubs} öppna
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Icons.Records />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Rekord</p>
                <p className="text-2xl font-bold text-gray-900">19</p>
                <p className="text-xs text-gray-500">
                  Distriktsrekord
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Icons.Sponsors />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Sponsorer</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSponsors}</p>
                <p className="text-xs text-gray-500">
                  Aktiva partners
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Icons.Board />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Styrelse</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBoardMembers}</p>
                <p className="text-xs text-gray-500">
                  Medlemmar
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Actions */}
          <div className="lg:col-span-2">
            {/* Quick Actions Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Enhanced News Card */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-1">
                  <div className="bg-white rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 p-3 bg-blue-100 rounded-xl">
                          <Icons.News />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-xl font-bold text-gray-900">Nyheter</h3>
                          <p className="text-sm text-gray-600">Hantera nyheter & meddelanden</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{stats.totalNews}</div>
                          <div className="text-xs text-gray-500">Totalt</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{stats.featuredNews}</div>
                          <div className="text-xs text-gray-500">Viktiga</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{stats.draftNews}</div>
                          <div className="text-xs text-gray-500">Utkast</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Link
                          href="/admin/news/new"
                          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-sm text-center block"
                        >
                          <div className="flex items-center justify-center">
                            <Icons.Plus />
                            <span className="ml-2">Skapa ny nyhet</span>
                          </div>
                        </Link>
                        <Link
                          href="/admin/news"
                          className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold text-sm text-center block"
                        >
                          <div className="flex items-center justify-center">
                            <Icons.Eye />
                            <span className="ml-2">Hantera alla ({stats.totalNews})</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Competitions Card */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-1">
                  <div className="bg-white rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 p-3 bg-green-100 rounded-xl">
                          <Icons.Competitions />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-xl font-bold text-gray-900">Tävlingar</h3>
                          <p className="text-sm text-gray-600">Hantera tävlingar & evenemang</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{stats.upcomingCompetitions}</div>
                          <div className="text-xs text-gray-500">Kommande</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{stats.ongoingCompetitions}</div>
                          <div className="text-xs text-gray-500">Pågående</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-600">{stats.completedCompetitions}</div>
                          <div className="text-xs text-gray-500">Avslutade</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Link
                          href="/admin/competitions/new"
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold text-sm text-center block"
                        >
                          <div className="flex items-center justify-center">
                            <Icons.Plus />
                            <span className="ml-2">Skapa ny tävling</span>
                          </div>
                        </Link>
                        <Link
                          href="/admin/competitions"
                          className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold text-sm text-center block"
                        >
                          <div className="flex items-center justify-center">
                            <Icons.Eye />
                            <span className="ml-2">Hantera alla ({stats.totalCompetitions})</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Clubs Card */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-1">
                  <div className="bg-white rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-xl">
                          <Icons.Clubs />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-xl font-bold text-gray-900">Klubbar</h3>
                          <p className="text-sm text-gray-600">Hantera klubbar & föreningar</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">{stats.totalClubs}</div>
                          <div className="text-xs text-gray-500">Totalt</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{stats.activeClubs}</div>
                          <div className="text-xs text-gray-500">Öppna</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Link
                          href="/admin/clubs/new"
                          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-4 py-3 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 font-semibold text-sm text-center block"
                        >
                          <div className="flex items-center justify-center">
                            <Icons.Plus />
                            <span className="ml-2">Lägg till klubb</span>
                          </div>
                        </Link>
                        <Link
                          href="/admin/clubs"
                          className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold text-sm text-center block"
                        >
                          <div className="flex items-center justify-center">
                            <Icons.Eye />
                            <span className="ml-2">Hantera alla ({stats.totalClubs})</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Records Card */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-1">
                  <div className="bg-white rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 p-3 bg-purple-100 rounded-xl">
                          <Icons.Records />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-xl font-bold text-gray-900">Distriktsrekord</h3>
                          <p className="text-sm text-gray-600">Hantera rekord & prestationer</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Link
                          href="/admin/records/new"
                          className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-semibold text-sm text-center block"
                        >
                          <div className="flex items-center justify-center">
                            <Icons.Plus />
                            <span className="ml-2">Nytt rekord</span>
                          </div>
                        </Link>
                        <Link
                          href="/admin/records"
                          className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold text-sm text-center block"
                        >
                          <div className="flex items-center justify-center">
                            <Icons.Eye />
                            <span className="ml-2">Se alla rekord</span>
                          </div>
                        </Link>
                        <Link
                          href="/admin/distriktsrekord-info"
                          className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold text-sm text-center block"
                        >
                          <div className="flex items-center justify-center">
                            <Icons.Edit />
                            <span className="ml-2">Redigera information</span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Management Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              {/* Calendar Management */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 p-3 bg-indigo-100 rounded-xl">
                    <Icons.Calendar />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">Kalender</h3>
                    <p className="text-sm text-gray-600">Hantera evenemang</p>
                  </div>
                </div>
                <Link
                  href="/admin/calendar"
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm text-center block"
                >
                  Hantera kalender
                </Link>
              </div>

              {/* Sponsors Management */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 p-3 bg-red-100 rounded-xl">
                    <Icons.Sponsors />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">Sponsorer</h3>
                    <p className="text-sm text-gray-600">{stats.totalSponsors} partners</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link
                    href="/admin/sponsors/new"
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm text-center block"
                  >
                    Lägg till sponsor
                  </Link>
                  <Link
                    href="/admin/sponsors"
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm text-center block"
                  >
                    Hantera alla
                  </Link>
                </div>
              </div>

              {/* Board Management */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 p-3 bg-gray-100 rounded-xl">
                    <Icons.Board />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-gray-900">Styrelse</h3>
                    <p className="text-sm text-gray-600">{stats.totalBoardMembers} medlemmar</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link
                    href="/admin/board"
                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors font-semibold text-sm text-center block"
                  >
                    Hantera styrelse
                  </Link>
                  <Link
                    href="/admin/contact"
                    className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm text-center block"
                  >
                    Kontaktinfo
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Recent Activity & Quick Info */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <Icons.Activity />
                <h3 className="text-lg font-bold text-gray-900 ml-2">Senaste aktivitet</h3>
              </div>
              <div className="space-y-4">
                {recentActivity.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      item.type === 'news' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {item.type === 'news' ? <Icons.News /> : <Icons.Competitions />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.date).toLocaleDateString('sv-SE')} • {item.status}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Ingen senaste aktivitet att visa
                  </p>
                )}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <Icons.TrendingUp />
                <h3 className="text-lg font-bold text-gray-900 ml-2">Systemstatus</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Databasstatus</span>
                  <span className="text-sm font-medium text-green-600">Aktiv</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bilduppladdning</span>
                  <span className="text-sm font-medium text-green-600">Fungerar</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI-bildgenerering</span>
                  <span className="text-sm font-medium text-green-600">Tillgänglig</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Senaste backup</span>
                  <span className="text-sm font-medium text-gray-600">
                    <div className="flex items-center">
                      <Icons.Clock />
                      <span className="ml-1">Idag</span>
                    </div>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-vgbf-blue to-vgbf-green rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Snabb översikt</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Totalt innehåll</span>
                  <span className="text-lg font-bold">
                    {stats.totalNews + stats.totalCompetitions + stats.totalClubs}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Aktivt innehåll</span>
                  <span className="text-lg font-bold">
                    {stats.featuredNews + stats.upcomingCompetitions + stats.activeClubs}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Partners & Styrelse</span>
                  <span className="text-lg font-bold">
                    {stats.totalSponsors + stats.totalBoardMembers}
                  </span>
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
