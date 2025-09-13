import { notFound } from 'next/navigation';
import { Page } from '@/app/api/pages/route';

interface PageDisplayProps {
  params: {
    slug: string;
  };
}

async function getPage(slug: string): Promise<Page | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/pages/${slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {page.title}
          </h1>
          
          {page.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              {page.excerpt}
            </p>
          )}
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center text-sm text-gray-500 space-x-4 mb-6">
            {page.author && (
              <span>By {page.author}</span>
            )}
            {page.created_at && (
              <span>
                Published {new Date(page.created_at).toLocaleDateString('sv-SE')}
              </span>
            )}
            {page.updated_at && page.updated_at !== page.created_at && (
              <span>
                Updated {new Date(page.updated_at).toLocaleDateString('sv-SE')}
              </span>
            )}
            <span>{page.view_count} views</span>
          </div>
          
          {/* Featured Image */}
          {page.featured_image && (
            <div className="mb-8">
              <img
                src={page.featured_image}
                alt={page.featured_image_alt || page.title}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}
        </header>
        
        {/* Content */}
        <article className="prose prose-lg max-w-none">
          <div 
            dangerouslySetInnerHTML={{ __html: page.content }}
            className="text-gray-800 leading-relaxed"
          />
        </article>
        
        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-500">
            <div>
              {page.meta_keywords && (
                <div className="mb-2">
                  <span className="font-medium">Tags: </span>
                  {page.meta_keywords.split(',').map((keyword, index) => (
                    <span key={index} className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700 mr-2 mb-2">
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <a 
                href="/" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}