import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ShareButtons from '@/components/ShareButtons'
import { getNewsBySlug, getAllNews } from '@/lib/news-storage-postgres'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

// Force dynamic rendering to prevent build-time database calls
export const dynamic = 'force-dynamic'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const article = await getNewsBySlug(params.slug)
    
    if (!article) {
      return {
        title: 'Artikel inte hittad - VGBF',
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vgbf.se'
    const articleUrl = `${baseUrl}/nyheter/${article.slug}`

    return {
      title: `${article.title} - Västra Götalands Bågskytteförbund`,
      description: article.excerpt,
      openGraph: {
        title: article.title,
        description: article.excerpt,
        url: articleUrl,
        siteName: 'Västra Götalands Bågskytteförbund',
        type: 'article',
        publishedTime: article.date,
        authors: article.author ? [article.author] : undefined,
        images: article.imageUrl ? [
          {
            url: article.imageUrl,
            alt: article.imageAlt || article.title,
          }
        ] : [
          {
            url: `${baseUrl}/vgbf-logo.png`,
            alt: 'Västra Götalands Bågskytteförbund',
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt,
        images: article.imageUrl ? [article.imageUrl] : [`${baseUrl}/vgbf-logo.png`],
      },
    }
  } catch (error) {
    console.warn('Failed to generate metadata for news article:', error)
    return {
      title: 'Nyheter - Västra Götalands Bågskytteförbund',
      description: 'Nyheter från Västra Götalands Bågskytteförbund',
    }
  }
}

export const dynamicParams = true

// Don't generate any static params - make it fully dynamic
export async function generateStaticParams() {
  // Return empty array to force dynamic rendering
  return []
}

export default async function NewsArticlePage({ params }: Props) {
  try {
    const article = await getNewsBySlug(params.slug)

    if (!article) {
      notFound()
    }

    return (
      <main className="min-h-screen bg-white">
        <Header />
        
        <div className="container mx-auto px-4 py-16 print-article">
          <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="mb-8 no-print">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-vgbf-blue">Hem</Link></li>
              <li>/</li>
              <li><Link href="/nyheter" className="hover:text-vgbf-blue">Nyheter</Link></li>
              <li>/</li>
              <li className="text-gray-700">{article.title}</li>
            </ol>
          </nav>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4 article-meta">
              <div className="text-sm text-gray-500">
                {new Date(article.date).toLocaleDateString('sv-SE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              {article.featured && (
                <span className="bg-vgbf-gold text-vgbf-blue px-3 py-1 rounded text-sm font-semibold">
                  Viktigt
                </span>
              )}
            </div>
            
            <h1 className="text-4xl font-bold text-vgbf-blue mb-4">
              {article.title}
            </h1>
            
            {article.author && (
              <p className="text-gray-600 mb-4">
                Av: <span className="font-medium">{article.author}</span>
              </p>
            )}
            
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag} className="bg-vgbf-blue text-white px-3 py-1 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div className="text-xl text-gray-700 mb-8 font-medium border-l-4 border-vgbf-gold pl-6">
              {article.excerpt}
            </div>
            
            {article.imageUrl && (
              <div className="mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.imageUrl}
                  alt={article.imageAlt || article.title}
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                />
                {article.imageAlt && (
                  <p className="text-sm text-gray-500 text-center mt-2 italic">
                    {article.imageAlt}
                  </p>
                )}
              </div>
            )}
            
            <div className="text-gray-800 leading-relaxed whitespace-pre-line">
              {article.content}
            </div>
          </div>

          {/* Share Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 share-buttons no-print">
            <ShareButtons 
              url={`/nyheter/${article.slug}`}
              title={article.title}
              description={article.excerpt}
              size="md"
            />
          </div>

          {/* Back to News */}
          <div className="mt-12 pt-8 border-t border-gray-200 no-print">
            <Link 
              href="/nyheter"
              className="inline-flex items-center text-vgbf-blue hover:text-vgbf-green transition-colors font-medium"
            >
              ← Tillbaka till nyheter
            </Link>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
  } catch (error) {
    console.error('Error loading news article:', error)
    notFound()
  }
}
