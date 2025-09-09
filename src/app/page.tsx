import Header from '@/components/Header'
import Hero from '@/components/Hero'
import SimpleNewsSection from '@/components/SimpleNewsSection'
import CompetitionsSection from '@/components/CompetitionsSection'
import RecordsHighlight from '@/components/RecordsHighlight'
import NextEvent from '@/components/NextEvent'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center md:text-left">
          <h2 className="text-2xl font-bold text-vgbf-blue">Nyheter & Kommande evenemang</h2>
          <p className="text-gray-600 mt-2">Senaste nytt från distriktet och nästa publika evenemang.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <SimpleNewsSection />
          </div>

          <div className="md:col-span-1">
            <div className="md:sticky md:top-24">
              <NextEvent />
            </div>
          </div>
        </div>
      </section>
      <CompetitionsSection />
      <RecordsHighlight />
      <Footer />
    </main>
  )
}
