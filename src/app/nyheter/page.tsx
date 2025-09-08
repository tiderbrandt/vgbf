import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllNews } from '@/lib/news-storage-postgres'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { NewsArticle } from '@/types'

export const metadata: Metadata = {
  title: 'Nyheter - Västra Götalands Bågskytteförbund',
  description: 'Senaste nyheterna från Västra Götalands Bågskytteförbund',
}

// Revalidate the page every 60 seconds to ensure fresh news data
export const revalidate = 0

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic'

// Fetch fresh data on every request
export const fetchCache = 'force-no-store'

async function getNewsData() {
  // Use the API endpoint to ensure consistency with admin interface
  let baseUrl = 'http://localhost:3000'
  
  if (process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`
  } else if (process.env.NODE_ENV === 'production') {
    baseUrl = 'https://vgbf.vercel.app'
  }
  
  console.log('Fetching news from:', `${baseUrl}/api/news`)
  console.log('Environment:', { 
    VERCEL_URL: process.env.VERCEL_URL, 
    NODE_ENV: process.env.NODE_ENV 
  })
  
  try {
    const response = await fetch(`${baseUrl}/api/news`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Successfully fetched news articles:', data.data?.length || 0)
    return data.data || []
  } catch (error) {
    console.error('Error fetching news from API:', error)
    // Fallback to direct database call
    console.log('Falling back to direct database call')
    return await getAllNews()
  }
}

export default async function NewsPage() {
  const allNews = await getNewsData()

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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allNews.map((article: NewsArticle) => (
            <article key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {article.imageUrl && (
                <div className="relative h-48 w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.imageUrl}
                    alt={article.imageAlt || article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-500">
                    {new Date(article.date).toLocaleDateString('sv-SE')}
                  </div>
                  {article.featured && (
                    <span className="bg-vgbf-gold text-vgbf-blue px-2 py-1 rounded text-xs font-semibold">
                      Viktigt
                    </span>
                  )}
                </div>
                
                <h2 className="text-xl font-semibold text-vgbf-blue mb-3 hover:text-vgbf-green transition-colors">
                  <Link href={`/nyheter/${article.slug}`}>
                    {article.title}
                  </Link>
                </h2>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                
                {article.author && (
                  <p className="text-sm text-gray-500 mb-3">
                    Av: {article.author}
                  </p>
                )}
                
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map((tag: string) => (
                      <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <Link 
                  href={`/nyheter/${article.slug}`}
                  className="text-vgbf-blue font-medium hover:text-vgbf-green transition-colors"
                >
                  Läs mer →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {allNews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Inga nyheter att visa just nu.</p>
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  )
}
