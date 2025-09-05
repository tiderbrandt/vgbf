import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getAllNews } from '@/lib/news-storage-blob'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { NewsArticle } from '@/types'

export const metadata: Metadata = {
  title: 'Nyheter - Västra Götalands Bågskytteförbund',
  description: 'Senaste nyheterna från Västra Götalands Bågskytteförbund',
}

export default async function NewsPage() {
  const allNews = await getAllNews()

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
