import Header from '@/components/Header'
import Hero from '@/components/Hero'
import EnhancedNewsSection from '@/components/EnhancedNewsSection'
import CompetitionsSection from '@/components/CompetitionsSection'
import RecordsHighlight from '@/components/RecordsHighlight'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <EnhancedNewsSection />
      <CompetitionsSection />
      <RecordsHighlight />
      <Footer />
    </main>
  )
}
