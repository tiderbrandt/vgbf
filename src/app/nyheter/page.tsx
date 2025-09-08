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
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-vgbf-blue mb-4">Nyheter</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Håll dig uppdaterad med de senaste nyheterna från Västra Götalands Bågskytteförbund
          </p>
        </div>

        <NewsClient />
      </div>

      <Footer />
    </main>
  )
}
