import Link from 'next/link'
import Image from 'next/image'
import { NewsArticle, ExternalNewsItem } from '@/types'
import { getRecentNews } from '@/lib/news-storage-postgres'

async function getExternalNews(): Promise<ExternalNewsItem[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/external-news`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      return []
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching external news:', error)
    return []
  }
}

async function getLocalNewsFromPostgreSQL(): Promise<NewsArticle[]> {
  try {
    const allNews = await getRecentNews(3)
    return allNews
  } catch (error) {
    console.error('Error reading PostgreSQL news:', error)
    return [
      {
        id: 'fallback-1',
        title: 'Välkommen till VGBF',
        excerpt: 'Västra Götalands Bågskytteförbund välkomnar alla bågskyttar i regionen.',
        content: 'Västra Götalands Bågskytteförbund arbetar för att utveckla bågskyttesporten i Västra Götaland.',
        date: '2025-09-05',
        author: 'VGBF',
        slug: 'valkomna-till-vgbf',
        featured: true,
        tags: ['Välkommen']
      }
    ]
  }
}

export default async function SimpleNewsSection() {
  // Get both local and external news
  const [localNews, externalNews] = await Promise.allSettled([
    getLocalNewsFromPostgreSQL(),
    getExternalNews()
  ])

  const local = localNews.status === 'fulfilled' ? localNews.value : []
  const external = externalNews.status === 'fulfilled' ? externalNews.value : []

  // If no news at all, show message
  if (local.length === 0 && external.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-vgbf-blue mb-4">Nyheter</h2>
            <p className="text-gray-600">Laddar nyheter...</p>
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
        {local.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-vgbf-blue mb-6">VGBF Nyheter</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {local.map((item) => (
                <article key={item.id} className="group bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transform transition-all duration-300">
                  <div className="relative h-48 w-full bg-gradient-to-br from-vgbf-blue/5 to-vgbf-green/5 overflow-hidden">
                    {/* next/image handles local and remote images; next.config.js allows Vercel blob domains */}
                    <Image
                      src={item.imageUrl || '/vgbf-logo.png'}
                      alt={item.imageAlt || item.title || 'VGBF'}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-vgbf-green rounded-full"></div>
                        <span className="text-sm text-gray-500 font-medium">
                          {new Date(item.date).toLocaleDateString('sv-SE')}
                        </span>
                      </div>
                      {item.featured && (
                        <span className="bg-gradient-to-r from-vgbf-gold to-yellow-400 text-vgbf-blue px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                          Viktigt
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-vgbf-blue mb-3 group-hover:text-vgbf-green transition-colors duration-200 leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {item.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div>
                        {item.author && (
                          <p className="text-sm text-gray-500 font-medium">Av: {item.author}</p>
                        )}
                      </div>
                      <a href={`/nyheter/${item.slug}`} className="inline-flex items-center gap-1 text-vgbf-blue font-semibold hover:text-vgbf-green transition-colors duration-200 group/link">
                        Läs mer 
                        <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* External News from Riksidrottsförbundet */}
        {external.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-vgbf-blue mb-6">Nyheter från Riksidrottsförbundet</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {external.map((item) => (
                <article key={item.id} className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transform transition-all duration-300">
                  <div className="relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-600 font-medium">
                            {new Date(item.date).toLocaleDateString('sv-SE')}
                          </span>
                        </div>
                        <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">
                          {item.source}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-vgbf-blue mb-3 group-hover:text-blue-700 transition-colors duration-200 leading-tight">
                        <a 
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {item.title}
                        </a>
                      </h4>
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {item.excerpt}
                      </p>
                      <a 
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200 group/link"
                      >
                        Läs mer på RF.se 
                        <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
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
