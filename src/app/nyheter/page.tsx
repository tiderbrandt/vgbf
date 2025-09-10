import Header from '@/components/Header'
import Footer from '@/components/Footer'
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
    <main className="min-h-screen bg-white">
      <Header />
      
      {/* Hero section with gradient - matching front page */}
      <section className="bg-gradient-to-b from-vgbf-blue to-vgbf-green text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Nyheter
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-95">
            Håll dig uppdaterad med de senaste nyheterna från Västra Götalands Bågskytteförbund
          </p>
          
          <div className="mt-10 max-w-3xl mx-auto text-sm text-white/90">
            <p>Upptäck aktuella händelser, tävlingsresultat och viktiga meddelanden från distriktet.</p>
          </div>
        </div>
      </section>

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
