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
  const featuredUpcoming = limitedUpcoming.length > 0 ? limitedUpcoming[0] : null
  const otherUpcoming = featuredUpcoming ? limitedUpcoming.slice(1) : limitedUpcoming

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-vgbf-blue mb-4">Tävlingar</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Här hittar du kommande och avslutade tävlingar inom distriktet
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Upcoming Competitions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-vgbf-blue">Kommande</h3>
              <Link href="/tavlingar/kommande" className="text-sm text-gray-600 hover:text-vgbf-blue">Visa alla →</Link>
            </div>

            <div className="space-y-4">
              {featuredUpcoming ? (
                <div className="rounded-xl overflow-hidden group">
                  <a href={`/tavlingar/${featuredUpcoming.id}`} className="block bg-gradient-to-br from-vgbf-green to-green-600 text-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group-hover:scale-[1.02]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="text-xs uppercase bg-white/20 backdrop-blur-sm inline-block px-3 py-1 rounded-full font-bold">Nästa tävling</div>
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        </div>
                        <h4 className="font-bold text-2xl mb-2 leading-tight">{featuredUpcoming.title}</h4>
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-sm opacity-95">{featuredUpcoming.organizer}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm opacity-95">{featuredUpcoming.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-semibold">{new Date(featuredUpcoming.date).toLocaleDateString('sv-SE')}</span>
                        </div>
                      </div>
                      <div className="ml-6 text-right flex-shrink-0">
                        <div className="text-center bg-white/20 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-md group-hover:bg-white/30 transition-colors">
                          <div className="text-2xl font-bold">{new Date(featuredUpcoming.date).getDate()}</div>
                          <div className="text-xs font-medium opacity-90">{new Date(featuredUpcoming.date).toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}</div>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              ) : null}

              {otherUpcoming.length > 0 ? otherUpcoming.map((competition) => (
                <div key={competition.id} className="rounded-xl overflow-hidden group">
                  <a href={`/tavlingar/${competition.id}`} className="block bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-vgbf-green p-6 rounded-r-xl hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300 group-hover:from-green-100 group-hover:to-emerald-100" aria-label={`Tävling ${competition.title}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-vgbf-blue text-lg mb-2 group-hover:text-green-700 transition-colors">{competition.title}</h4>
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>{competition.organizer}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{competition.location}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-vgbf-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm text-vgbf-green font-semibold">{new Date(competition.date).toLocaleDateString('sv-SE')}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <div className="text-center bg-green-100 border border-green-200 px-3 py-2 rounded-lg shadow-sm group-hover:bg-green-200 transition-colors">
                          <div className="text-lg font-bold text-green-700">{new Date(competition.date).getDate()}</div>
                          <div className="text-xs font-medium text-green-600">{new Date(competition.date).toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}</div>
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              )) : (
                <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded-r-lg">
                  <p className="text-gray-600 text-center">Inga kommande tävlingar för tillfället</p>
                </div>
              )}
            </div>
          </div>

          {/* Completed Competitions */}
          <div>
            <h3 className="text-2xl font-semibold text-vgbf-blue mb-6">Avslutade</h3>
            <div className="space-y-4">
              {limitedCompleted.length > 0 ? limitedCompleted.map((competition) => (
                <div key={competition.id} className="rounded-lg overflow-hidden">
                  <a href={`/tavlingar/${competition.id}`} className="block bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg hover:shadow-md hover:-translate-y-0.5 transform transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-700">{competition.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{competition.organizer}</p>
                        <p className="text-sm text-gray-600 mt-1">{competition.location}</p>
                        <p className="text-sm text-gray-500 font-medium mt-1">{new Date(competition.date).toLocaleDateString('sv-SE')}</p>
                      </div>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">{new Date(competition.date).getDate()} {new Date(competition.date).toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}</span>
                    </div>
                  </a>
                </div>
              )) : (
                <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded-r-lg">
                  <p className="text-gray-600 text-center">Inga avslutade tävlingar att visa</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/tavlingar/kommande"
              className="bg-vgbf-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Se alla kommande tävlingar
            </Link>
            <Link 
              href="/tavlingar/avslutade"
              className="border-2 border-vgbf-blue text-vgbf-blue px-6 py-3 rounded-lg font-semibold hover:bg-vgbf-blue hover:text-white transition-colors"
            >
              Se alla avslutade tävlingar
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
