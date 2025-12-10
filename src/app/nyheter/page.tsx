import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import NewsClient from '@/components/NewsClient'
import { Metadata } from 'next'
import { getAllNews } from '@/lib/news-storage-postgres'

export const metadata: Metadata = {
  title: 'Nyheter - Västra Götalands Bågskytteförbund',
  description: 'Senaste nyheterna från Västra Götalands Bågskytteförbund',
}

// Force dynamic rendering and disable caching completely
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function NewsPage() {
  const news = await getAllNews()

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <Hero 
        title="Nyheter"
        subtitle="Håll dig uppdaterad med de senaste nyheterna från Västra Götalands Bågskytteförbund"
        description="Upptäck aktuella händelser, tävlingsresultat och viktiga meddelanden från distriktet."
        showButtons={false}
      />

      {/* Content section with consistent styling */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center md:text-left">
          <h2 className="text-2xl font-bold text-vgbf-blue">Senaste nyheterna</h2>
          <p className="text-gray-600 mt-2">Aktuella nyheter och meddelanden från förbundet.</p>
        </div>

        <NewsClient initialNews={news} />
      </section>

      <Footer />
    </main>
  )
}
