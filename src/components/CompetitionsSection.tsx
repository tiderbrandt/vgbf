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

  // Show only first 5 upcoming for homepage
  const limitedUpcoming = upcomingCompetitions.slice(0, 5)

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Simple Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Tävlingar</h2>
            <p className="text-gray-600">Kommande tävlingar och evenemang</p>
          </div>
          <Link 
            href="/tavlingar" 
            className="text-vgbf-blue hover:text-blue-700 font-medium flex items-center gap-1"
          >
            Visa alla
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Competition List */}
        {limitedUpcoming.length > 0 ? (
          <div className="space-y-6">
            {limitedUpcoming.map((competition) => (
              <CompetitionRow key={competition.id} competition={competition} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Inga kommande tävlingar</h3>
            <p className="text-gray-600">Nya tävlingar publiceras löpande</p>
          </div>
        )}
      </div>
    </section>
  )
}

function CompetitionRow({ competition }: { competition: Competition }) {
  const eventDate = new Date(competition.date)
  const registrationDeadline = competition.registrationDeadline ? new Date(competition.registrationDeadline) : null
  const isRegistrationOpen = registrationDeadline ? new Date() < registrationDeadline : true
  
  return (
    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      {/* Left side - Date and Info */}
      <div className="flex items-center gap-6">
        {/* Date */}
        <div className="text-center">
          <div className="text-2xl font-bold text-vgbf-blue">{eventDate.getDate()}</div>
          <div className="text-sm text-gray-600 uppercase">{eventDate.toLocaleDateString('sv-SE', { month: 'short' })}</div>
        </div>
        
        {/* Competition Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{competition.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{competition.location}</span>
            <span>•</span>
            <span className="capitalize">{competition.category}</span>
            {registrationDeadline && (
              <>
                <span>•</span>
                <span>Anmälan till {registrationDeadline.toLocaleDateString('sv-SE')}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Registration Status */}
      <div className="text-right">
        {isRegistrationOpen ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Anmälan öppen
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            Anmälan stängd
          </span>
        )}
      </div>
    </div>
  )
}
