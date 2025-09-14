'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Page } from '@/app/api/pages/route';

interface PageListProps {
  showFeaturedOnly?: boolean;
  showInNavigation?: boolean;
  limit?: number;
  className?: string;
}

export default function PageList({ 
  showFeaturedOnly = false, 
  showInNavigation = false,
  limit,
  className = '' 
}: PageListProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPages();
  }, [showFeaturedOnly, showInNavigation, limit]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        status: 'published'
      });
      
      if (showFeaturedOnly) {
        params.append('featured', 'true');
      }
      
      if (showInNavigation) {
        params.append('navigation', 'true');
      }
      
      if (limit) {
        params.append('limit', limit.toString());
      }
      
      const response = await fetch(`/api/pages?${params}`);
      console.log(`PageList fetch: /api/pages?${params}`, response.status);
      if (!response.ok) throw new Error(`Failed to fetch pages: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      console.log('PageList received data:', data);
      setPages(data.pages || []);
    } catch (err) {
      console.error('PageList fetch error:', err);
      setError('Failed to load pages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-600 ${className}`}>
        <p>{error}</p>
        <p className="text-sm mt-2">Debug: showFeaturedOnly={showFeaturedOnly ? 'true' : 'false'}, limit={limit}</p>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className={`text-gray-500 ${className}`}>
        <p>No pages found.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {pages.map((page) => (
          <article key={page.id} className="group">
            <Link href={`/${page.slug}`} className="block">
              <div className="flex space-x-4">
                {/* Featured Image */}
                {page.featured_image && (
                  <div className="flex-shrink-0">
                    <img
                      src={page.featured_image}
                      alt={page.featured_image_alt || page.title}
                      className="w-20 h-20 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {page.title}
                  </h3>
                  
                  {page.excerpt && (
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {page.excerpt}
                    </p>
                  )}
                  
                  <div className="mt-2 flex items-center text-xs text-gray-500 space-x-3">
                    {page.author && (
                      <span>By {page.author}</span>
                    )}
                    {page.created_at && (
                      <span>
                        {new Date(page.created_at).toLocaleDateString('sv-SE')}
                      </span>
                    )}
                    <span>{page.view_count} views</span>
                    {page.featured && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}