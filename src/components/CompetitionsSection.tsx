import Link from 'next/link'
import { getUpcomingCompetitions, getPastCompetitions as getCompletedCompetitions } from '@/lib/competitions-storage-postgres'
import { Competition } from '@/types'

export default async function CompetitionsSection() {
  let upcomingCompetitions: Competition[] = []
  let completedCompetitions: Competition[] = []

  try {
    console.log('CompetitionsSection: Fetching competitions...')
    upcomingCompetitions = await getUpcomingCompetitions()
    completedCompetitions = await getCompletedCompetitions()
    
    console.log('CompetitionsSection: Fetched', upcomingCompetitions?.length || 0, 'upcoming and', completedCompetitions?.length || 0, 'completed competitions')
  } catch (error) {
    console.warn('CompetitionsSection: Failed to fetch competitions during build, using empty arrays:', error)
    upcomingCompetitions = []
    completedCompetitions = []
  }

  // Ensure we have arrays (defensive programming)
  upcomingCompetitions = Array.isArray(upcomingCompetitions) ? upcomingCompetitions : []
  completedCompetitions = Array.isArray(completedCompetitions) ? completedCompetitions : []

  // Show only first 3 of each for homepage
  const limitedUpcoming = upcomingCompetitions.slice(0, 3)
  const limitedCompleted = completedCompetitions.slice(0, 3)

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-vgbf-blue/10 text-vgbf-blue px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tävlingar & Evenemang
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Testa dina <span className="text-transparent bg-clip-text bg-gradient-to-r from-vgbf-blue to-vgbf-green">färdigheter</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Delta i spännande tävlingar och utveckla ditt bågskyttande tillsammans med andra entusiaster från hela distriktet
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Featured Upcoming Competition */}
          {limitedUpcoming.length > 0 && (
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Kommande Tävlingar</h3>
                <Link href="/tavlingar/kommande" className="text-vgbf-blue hover:text-blue-700 font-medium flex items-center gap-1 text-sm">
                  Visa alla
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              <FeaturedCompetitionCard competition={limitedUpcoming[0]} />
              
              {limitedUpcoming.slice(1).length > 0 && (
                <div className="mt-6 space-y-4">
                  {limitedUpcoming.slice(1).map((competition) => (
                    <CompetitionCard key={competition.id} competition={competition} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Results */}
          <div className={limitedUpcoming.length === 0 ? "lg:col-span-3" : "lg:col-span-1"}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Senaste Resultat</h3>
              <Link href="/tavlingar/avslutade" className="text-gray-600 hover:text-vgbf-blue font-medium flex items-center gap-1 text-sm">
                Visa alla
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="space-y-4">
              {limitedCompleted.length > 0 ? limitedCompleted.map((competition) => (
                <CompletedCompetitionCard key={competition.id} competition={competition} />
              )) : (
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">Inga avslutade tävlingar att visa</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-vgbf-blue to-vgbf-green rounded-2xl p-8 md:p-12 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Redo att tävla?</h3>
            <p className="text-xl mb-8 opacity-90">
              Upptäck alla våra tävlingar och hitta den perfekta utmaningen för din nivå
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/tavlingar/kommande"
                className="bg-white text-vgbf-blue px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Kommande Tävlingar
              </Link>
              <Link 
                href="/tavlingar"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-vgbf-blue transition-colors"
              >
                Alla Tävlingar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturedCompetitionCard({ competition }: { competition: Competition }) {
  const eventDate = new Date(competition.date)
  const registrationDeadline = competition.registrationDeadline ? new Date(competition.registrationDeadline) : null
  const isRegistrationOpen = registrationDeadline ? new Date() < registrationDeadline : true
  
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Date Badge */}
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-br from-vgbf-blue to-vgbf-green text-white rounded-2xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold">{eventDate.getDate()}</div>
              <div className="text-sm font-medium opacity-90">{eventDate.toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}</div>
              <div className="text-xs opacity-75">{eventDate.getFullYear()}</div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <CategoryBadge category={competition.category} />
              {isRegistrationOpen && competition.registrationUrl && (
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                  🟢 Anmälan öppen
                </span>
              )}
            </div>
            
            <h4 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 group-hover:text-vgbf-blue transition-colors">
              {competition.title}
            </h4>
            
            {competition.description && (
              <p className="text-gray-600 mb-4 line-clamp-2">{competition.description}</p>
            )}
            
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 text-gray-600">
                <svg className="w-5 h-5 text-vgbf-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-medium">{competition.organizer}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <svg className="w-5 h-5 text-vgbf-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">{competition.location}</span>
              </div>
            </div>
            
            {registrationDeadline && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="text-sm text-yellow-800">
                  <strong>Anmälning stänger:</strong> {registrationDeadline.toLocaleDateString('sv-SE')}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3">
              <Link 
                href={`/tavlingar/${competition.id}`}
                className="bg-vgbf-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Läs mer
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              {competition.registrationUrl && isRegistrationOpen && (
                <a 
                  href={competition.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-vgbf-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  Anmäl dig
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CompetitionCard({ competition }: { competition: Competition }) {
  const eventDate = new Date(competition.date)
  
  return (
    <Link href={`/tavlingar/${competition.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-vgbf-blue/30 transition-all duration-200">
        <div className="flex items-start gap-4">
          <div className="bg-gradient-to-br from-vgbf-blue to-vgbf-green text-white rounded-lg p-3 text-center min-w-[60px]">
            <div className="text-lg font-bold">{eventDate.getDate()}</div>
            <div className="text-xs opacity-90">{eventDate.toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}</div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge category={competition.category} size="sm" />
            </div>
            <h5 className="font-bold text-gray-900 mb-1 group-hover:text-vgbf-blue transition-colors">
              {competition.title}
            </h5>
            <p className="text-sm text-gray-600 mb-1">{competition.organizer}</p>
            <p className="text-sm text-gray-500">{competition.location}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}

function CompletedCompetitionCard({ competition }: { competition: Competition }) {
  const eventDate = new Date(competition.date)
  
  return (
    <Link href={`/tavlingar/${competition.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h5 className="font-semibold text-gray-900 mb-1 group-hover:text-vgbf-blue transition-colors text-sm">
              {competition.title}
            </h5>
            <p className="text-xs text-gray-600 mb-1">{competition.organizer}</p>
            <p className="text-xs text-gray-500">{eventDate.toLocaleDateString('sv-SE')}</p>
          </div>
          <div className="flex items-center gap-2">
            {competition.resultsUrl && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                Resultat
              </span>
            )}
            <CategoryBadge category={competition.category} size="xs" />
          </div>
        </div>
      </div>
    </Link>
  )
}

function CategoryBadge({ category, size = 'md' }: { category?: string; size?: 'xs' | 'sm' | 'md' }) {
  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1'
  }
  
  const baseClasses = `inline-flex items-center gap-1 rounded-full font-medium ${sizeClasses[size]}`
  
  switch (category) {
    case 'outdoor':
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-700`}>
          🏹 Utomhus
        </span>
      )
    case 'indoor':
      return (
        <span className={`${baseClasses} bg-purple-100 text-purple-700`}>
          🎯 Inomhus
        </span>
      )
    case '3d':
      return (
        <span className={`${baseClasses} bg-green-100 text-green-700`}>
          🌲 3D
        </span>
      )
    case 'field':
      return (
        <span className={`${baseClasses} bg-orange-100 text-orange-700`}>
          🌾 Fält
        </span>
      )
    default:
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-700`}>
          🏆 Tävling
        </span>
      )
  }
}
