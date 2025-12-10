import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import CompetitionsClient from '@/components/CompetitionsClient'
import { getAllCompetitions } from '@/lib/competitions-storage-postgres'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tävlingar - Västra Götalands Bågskytteförbund',
  description: 'Kommande och genomförda tävlingar inom Västra Götalands Bågskytteförbund',
}

// Force dynamic rendering and disable caching completely
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function CompetitionsPage() {
  const competitions = await getAllCompetitions()

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <Hero 
        title="Tävlingar"
        subtitle="Upptäck kommande tävlingar, följ pågående evenemang och se resultat från avslutade tävlingar"
        description="Här hittar du alla tävlingar inom distriktet samt externa tävlingar som kan vara av intresse."
        showButtons={false}
      />
      
      <CompetitionsClient initialCompetitions={competitions} />
      
      <Footer />
    </main>
  )
}
