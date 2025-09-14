import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PageHero from '@/components/PageHero'
import NewsClient from '@/components/NewsClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nyheter - Västra Götalands Bågskytteförbund',
  description: 'Senaste nyheterna från Västra Götalands Bågskytteförbund',
}

// Force dynamic rendering and disable caching completely
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function NewsPage() {
  return (
    <main className="min-h-screen bg-white page-with-logo-bg">
      <Header />
      
      <PageHero 
        title="Nyheter"
        description="Håll dig uppdaterad med de senaste nyheterna från Västra Götalands Bågskytteförbund"
        subtitle="Upptäck aktuella händelser, tävlingsresultat och viktiga meddelanden från distriktet."
      />

      {/* Content section with consistent styling */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center md:text-left">
          <h2 className="text-2xl font-bold text-vgbf-blue">Senaste nyheterna</h2>
          <p className="text-gray-600 mt-2">Aktuella nyheter och meddelanden från förbundet.</p>
        </div>

        <NewsClient />
      </section>

      <Footer />
    </main>
  )
}
