import Header from '@/components/Header'
import Hero from '@/components/Hero'
import SimpleNewsSection from '@/components/SimpleNewsSection'
import CompetitionsSection from '@/components/CompetitionsSection'
import RecordsHighlight from '@/components/RecordsHighlight'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <SimpleNewsSection />
      <CompetitionsSection />
      <RecordsHighlight />
      <Footer />
    </main>
  )
}
