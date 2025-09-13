import Header from '@/components/Header'
import Hero from '@/components/Hero'
import SimpleNewsSection from '@/components/SimpleNewsSection'
import CompetitionsSection from '@/components/CompetitionsSection'
import RecordsHighlight from '@/components/RecordsHighlight'
import SponsorsSection from '@/components/SponsorsSection'
import UpcomingEvents from '@/components/UpcomingEvents'
import PageList from '@/components/PageList'
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
              <UpcomingEvents />
            </div>
          </div>
        </div>
      </section>
      <CompetitionsSection />
      
      {/* Featured Pages Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-vgbf-blue mb-4">Viktiga sidor</h2>
            <p className="text-lg text-gray-600">
              Läs mer om våra utvalda artiklar och information
            </p>
          </div>
          <PageList 
            showFeaturedOnly={true} 
            limit={3}
            className="max-w-4xl mx-auto"
          />
        </div>
      </section>
      
      {/* Records and Sponsors side by side */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <RecordsHighlight />
            </div>
            <div>
              <SponsorsSection />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  )
}
