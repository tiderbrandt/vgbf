import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import ClubsClient from '@/components/ClubsClient'
import { getAllClubs } from '@/lib/clubs-storage-postgres'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Klubbar - Västra Götalands Bågskytteförbund',
  description: 'Hitta bågskytteklubbar i Västra Götaland',
}

// Force dynamic rendering and disable caching completely
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function ClubsPage() {
  const clubs = await getAllClubs()

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <Hero 
        title="Klubbar i Västra Götaland"
        subtitle="Upptäck bågskytteklubbar i vårt distrikt och hitta den som passar dig bäst"
        description="Använd sökfunktionen och filtren nedan för att hitta klubbar i ditt område."
        showButtons={false}
      />
      
      <ClubsClient initialClubs={clubs} />
      
      <Footer />
    </main>
  )
}
