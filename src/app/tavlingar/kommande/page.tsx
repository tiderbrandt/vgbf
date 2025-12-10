import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CompetitionCard from '@/components/CompetitionCard'
import { getUpcomingCompetitions } from '@/lib/competitions-storage-postgres'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kommande tävlingar - VGBF',
  description: 'Se alla kommande bågskyttetävlingar i Västra Götaland.',
}

export const dynamic = 'force-dynamic'

export default async function UpcomingCompetitionsPage() {
  const competitions = await getUpcomingCompetitions()

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kommande tävlingar</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Alla tävlingar som kommer att äga rum framöver
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">

          {/* Navigation */}
          <div className="mb-8">
            <nav className="flex gap-4">
              <Link
                href="/tavlingar"
                className="text-vgbf-blue hover:text-vgbf-green font-medium"
              >
                ← Tillbaka till alla tävlingar
              </Link>
            </nav>
          </div>

          {/* Competitions Grid */}
          {competitions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-blue-400 text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Inga kommande tävlingar</h3>
              <p className="text-gray-500">
                Det finns inga kommande tävlingar inplanerade just nu.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map((competition) => (
                <CompetitionCard key={competition.id} competition={competition} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}

