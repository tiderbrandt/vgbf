import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CompetitionCard from '@/components/CompetitionCard'
import { getPastCompetitions } from '@/lib/competitions-storage-postgres'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Avslutade tävlingar - VGBF',
  description: 'Se resultat och information från tidigare tävlingar.',
}

export const dynamic = 'force-dynamic'

export default async function CompletedCompetitionsPage() {
  const competitions = await getPastCompetitions()

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-gray-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Avslutade tävlingar</h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto">
            Resultat och information från genomförda tävlingar
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
              <div className="text-gray-400 text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Inga avslutade tävlingar</h3>
              <p className="text-gray-500">
                Det finns inga avslutade tävlingar att visa än.
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
