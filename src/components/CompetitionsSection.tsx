import Link from 'next/link'
import { getUpcomingCompetitions, getPastCompetitions as getCompletedCompetitions } from '@/lib/competitions-storage-unified'

export default async function CompetitionsSection() {
  const upcomingCompetitions = await getUpcomingCompetitions()
  const completedCompetitions = await getCompletedCompetitions()

  // Show only first 3 of each for homepage
  const limitedUpcoming = upcomingCompetitions.slice(0, 3)
  const limitedCompleted = completedCompetitions.slice(0, 3)

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
            <h3 className="text-2xl font-semibold text-vgbf-blue mb-6">Kommande</h3>
            <div className="space-y-4">
              {limitedUpcoming.map((competition) => (
                <div key={competition.id} className="bg-green-50 border-l-4 border-vgbf-green p-4 rounded-r-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-vgbf-blue">{competition.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{competition.organizer}</p>
                      <p className="text-sm text-gray-600 mt-1">{competition.location}</p>
                      <p className="text-sm text-vgbf-green font-medium mt-1">
                        {new Date(competition.date).toLocaleDateString('sv-SE')}
                      </p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {new Date(competition.date).getDate()} {new Date(competition.date).toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Competitions */}
          <div>
            <h3 className="text-2xl font-semibold text-vgbf-blue mb-6">Avslutade</h3>
            <div className="space-y-4">
              {limitedCompleted.map((competition) => (
                <div key={competition.id} className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-700">{competition.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{competition.organizer}</p>
                      <p className="text-sm text-gray-600 mt-1">{competition.location}</p>
                      <p className="text-sm text-gray-500 font-medium mt-1">
                        {new Date(competition.date).toLocaleDateString('sv-SE')}
                      </p>
                    </div>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      {new Date(competition.date).getDate()} {new Date(competition.date).toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
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
