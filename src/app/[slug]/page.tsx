import { notFound } from 'next/navigation';
import { Page } from '@/app/api/pages/route';
import { sql } from '@/lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

// Don't generate any static params - make it fully dynamic
export async function generateStaticParams() {
  // Return empty array to force dynamic rendering
  return [];
}

interface PageDisplayProps {
  params: {
    slug: string;
  };
}

async function getPage(slug: string): Promise<Page | null> {
  try {
    // For dynamic pages, fetch directly from database - use template literal syntax
    const result = await sql`
      SELECT * FROM pages 
      WHERE (slug = ${slug} OR id::text = ${slug}) 
      AND status = 'published' 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    // Handle both pg Pool result (result.rows) and Neon direct array result
    const rows = Array.isArray(result) ? result : (result.rows || []);
    
    if (rows.length === 0) {
      return null;
    }
    
    const page = rows[0];
    
    // Update view count
    await sql`UPDATE pages SET view_count = view_count + 1 WHERE id = ${page.id}`;
    
    return page;
  } catch (error) {
    console.error('Error fetching page:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageDisplayProps) {
  const page = await getPage(params.slug);
  
  if (!page) {
    return {
      title: 'Page Not Found',
    };
  }
  
  return {
    title: page.meta_title || page.title,
    description: page.meta_description || page.excerpt,
    keywords: page.meta_keywords,
    openGraph: {
      title: page.meta_title || page.title,
      description: page.meta_description || page.excerpt,
      images: page.featured_image ? [
        {
          url: page.featured_image,
          alt: page.featured_image_alt || page.title,
        }
      ] : [],
    },
  };
}

export default async function PageDisplay({ params }: PageDisplayProps) {
  const page = await getPage(params.slug);
  
  if (!page || page.status !== 'published') {
    notFound();
  }
  
  // Increment view count (fire and forget)
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    fetch(`${baseUrl}/api/pages/${page.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ increment_views: true })
    }).catch(() => {}); // Silently fail if view count update fails
  } catch (error) {
    // Silently fail
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {page.title}
          </h1>
          
          {page.excerpt && (
            <div className="bg-gray-50 border-l-4 border-vgbf-blue p-6 mb-6 rounded-r-lg">
              <p className="text-xl text-gray-700 leading-relaxed font-medium">
                {page.excerpt}
              </p>
            </div>
          )}
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center text-sm text-gray-500 space-x-4 mb-6 pb-4 border-b border-gray-200">
            {page.author && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Av {page.author}</span>
              </div>
            )}
            {page.created_at && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Publicerad {new Date(page.created_at).toLocaleDateString('sv-SE')}</span>
              </div>
            )}
            {page.updated_at && page.updated_at !== page.created_at && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Uppdaterad {new Date(page.updated_at).toLocaleDateString('sv-SE')}</span>
              </div>
            )}
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{page.view_count} visningar</span>
            </div>
          </div>
          
          {/* Featured Image */}
          {page.featured_image && (
            <div className="mb-8">
              <img
                src={page.featured_image}
                alt={page.featured_image_alt || page.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
              {page.featured_image_alt && (
                <p className="text-sm text-gray-500 mt-2 text-center italic">
                  {page.featured_image_alt}
                </p>
              )}
            </div>
          )}
        </header>
        
        {/* Content */}
        <article className="prose prose-lg prose-blue max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: page.content }}
            className="text-gray-800 leading-relaxed [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-vgbf-blue [&>h1]:mt-8 [&>h1]:mb-4 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-vgbf-blue [&>h2]:mt-6 [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:mt-5 [&>h3]:mb-2 [&>p]:mb-4 [&>p]:leading-relaxed [&>ul]:mb-4 [&>ol]:mb-4 [&>li]:mb-1 [&>blockquote]:border-l-4 [&>blockquote]:border-vgbf-blue [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:bg-gray-50 [&>blockquote]:py-3 [&>blockquote]:my-4 [&>img]:rounded-lg [&>img]:shadow-md [&>img]:my-6"
          />
        </article>
        
        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between">
            <div className="w-full md:w-auto mb-4 md:mb-0">
              {page.meta_keywords && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Relaterade ämnen:</h4>
                  <div className="flex flex-wrap gap-2">
                    {page.meta_keywords.split(',').map((keyword, index) => (
                      <span key={index} className="inline-block bg-vgbf-blue/10 text-vgbf-blue rounded-full px-3 py-1 text-xs font-medium">
                        {keyword.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/pages" 
                className="text-vgbf-blue hover:text-vgbf-green font-medium transition-colors"
              >
                ← Alla sidor
              </a>
              <a 
                href="/" 
                className="text-vgbf-blue hover:text-vgbf-green font-medium transition-colors"
              >
                ← Hem
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}