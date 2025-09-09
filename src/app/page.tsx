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
  <NextEvent />
      <SimpleNewsSection />
      <CompetitionsSection />
      <RecordsHighlight />
      <Footer />
    </main>
  )
}
