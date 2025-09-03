import Header from '@/components/Header'
import Hero from '@/components/Hero'
import NewsSection from '@/components/NewsSection'
import CompetitionsSection from '@/components/CompetitionsSection'
import RecordsHighlight from '@/components/RecordsHighlight'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <NewsSection />
      <CompetitionsSection />
      <RecordsHighlight />
      <Footer />
    </main>
  )
}
