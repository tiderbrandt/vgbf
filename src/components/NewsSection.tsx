import Link from 'next/link'
import Image from 'next/image'
import { getRecentNews } from '@/lib/news-storage-postgres'

export default async function NewsSection() {
  let news
  try {
    news = await getRecentNews(4)
  } catch (error) {
    console.error('Error loading news:', error)
    // Return a fallback UI instead of crashing
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-vgbf-blue mb-4">Nyheter</h2>
            <p className="text-gray-600">
              Kunde inte ladda nyheter just nu. Försök igen senare.
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (!news || news.length === 0) {
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
            Håll dig uppdaterad med de senaste nyheterna från Västra Götalands Bågskytteförbund
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          {news.map((item) => (
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
                <h3 className="text-xl font-semibold text-vgbf-blue mb-3 hover:text-vgbf-green transition-colors">
                  <Link href={`/nyheter/${item.slug}`}>
                    {item.title}
                  </Link>
                </h3>
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

        <div className="text-center">
          <Link 
            href="/nyheter"
            className="inline-block bg-vgbf-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-vgbf-green transition-colors"
          >
            Se alla nyheter
          </Link>
        </div>
      </div>
    </section>
  )
}
