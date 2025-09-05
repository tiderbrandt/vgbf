import Link from 'next/link'
import { getRecentNews } from '@/lib/news-storage-blob'
import { ExternalNewsItem, NewsArticle } from '@/types'

async function getExternalNews(): Promise<ExternalNewsItem[]> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/external-news`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!response.ok) {
      console.error('Failed to fetch external news:', response.status)
      return []
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching external news:', error)
    return []
  }
}

export default async function EnhancedNewsSection() {
  let localNews: NewsArticle[] = []
  let externalNews: ExternalNewsItem[] = []

  try {
    // Fetch both local and external news
    const [localNewsResult, externalNewsResult] = await Promise.allSettled([
      getRecentNews(3),
      getExternalNews()
    ])

    localNews = localNewsResult.status === 'fulfilled' ? localNewsResult.value : []
    externalNews = externalNewsResult.status === 'fulfilled' ? externalNewsResult.value : []
  } catch (error) {
    console.error('Error loading news:', error)
    // localNews already initialized as empty array
  }

  // If no news at all, show fallback
  if (localNews.length === 0 && externalNews.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-vgbf-blue mb-4">Nyheter</h2>
            <p className="text-gray-600">Inga nyheter att visa just nu.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-vgbf-blue mb-4">Nyheter</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Håll dig uppdaterad med de senaste nyheterna från Västra Götalands Bågskytteförbund och svensk idrott
          </p>
        </div>

        {/* Local VGBF News */}
        {localNews.length > 0 && (
          <>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-vgbf-blue mb-6">VGBF Nyheter</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {localNews.map((item) => (
                  <article key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    {item.imageUrl && (
                      <div className="relative h-48 w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.imageAlt || item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-500">
                          {new Date(item.date).toLocaleDateString('sv-SE')}
                        </div>
                        {item.featured && (
                          <span className="bg-vgbf-gold text-vgbf-blue px-2 py-1 rounded text-xs font-semibold">
                            Viktigt
                          </span>
                        )}
                      </div>
                      <h4 className="text-xl font-semibold text-vgbf-blue mb-3 hover:text-vgbf-green transition-colors">
                        <Link href={`/nyheter/${item.slug}`}>
                          {item.title}
                        </Link>
                      </h4>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {item.excerpt}
                      </p>
                      {item.author && (
                        <p className="text-sm text-gray-500 mb-3">
                          Av: {item.author}
                        </p>
                      )}
                      <Link 
                        href={`/nyheter/${item.slug}`}
                        className="text-vgbf-blue font-medium hover:text-vgbf-green transition-colors"
                      >
                        Läs mer →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </>
        )}

        {/* External News from Riksidrottsförbundet */}
        {externalNews.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-vgbf-blue mb-6">Nyheter från Riksidrottsförbundet</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {externalNews.map((item) => (
                <article key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-500">
                        {new Date(item.date).toLocaleDateString('sv-SE')}
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                        {item.source}
                      </span>
                    </div>
                    <h4 className="text-xl font-semibold text-vgbf-blue mb-3 hover:text-vgbf-green transition-colors">
                      <a 
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {item.title}
                      </a>
                    </h4>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {item.excerpt}
                    </p>
                    <a 
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-vgbf-blue font-medium hover:text-vgbf-green transition-colors inline-flex items-center"
                    >
                      Läs mer på RF.se 
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        <div className="text-center">
          <Link 
            href="/nyheter"
            className="inline-block bg-vgbf-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-vgbf-green transition-colors"
          >
            Se alla VGBF nyheter
          </Link>
        </div>
      </div>
    </section>
  )
}
