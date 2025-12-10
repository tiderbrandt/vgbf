import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CompetitionCard from '@/components/CompetitionCard'
import { getOngoingCompetitions } from '@/lib/competitions-storage-postgres'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pågående tävlingar - VGBF',
  description: 'Följ pågående bågskyttetävlingar i Västra Götaland.',
}

export const dynamic = 'force-dynamic'

export default async function OngoingCompetitionsPage() {
  const competitions = await getOngoingCompetitions()

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Pågående tävlingar</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            Tävlingar som pågår just nu
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
              <div className="text-green-400 text-6xl mb-4">🏹</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Inga pågående tävlingar</h3>
              <p className="text-gray-500">
                Det pågår inga tävlingar just nu.
              </p>
              <div className="mt-6">
                <Link
                  href="/tavlingar/kommande"
                  className="text-vgbf-blue hover:text-vgbf-green font-medium"
                >
                  Se kommande tävlingar →
                </Link>
              </div>
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
