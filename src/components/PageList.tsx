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
    console.log('PageList: Component mounted/props changed, starting fetch...');
    fetchPages();
  }, [showFeaturedOnly, showInNavigation, limit]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous error
      console.log('PageList: Starting fetch with props:', { showFeaturedOnly, showInNavigation, limit });
      
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

      const url = `/api/pages?${params}`;
      console.log('PageList: Fetching URL:', url);
      
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      clearTimeout(timeoutId);
      
      console.log('PageList: Response received:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('PageList: Data received:', data);
      
      if (data && data.pages) {
        setPages(data.pages);
        console.log('PageList: Set pages:', data.pages.length, 'items');
      } else {
        console.error('PageList: Invalid data structure:', data);
        setError('Invalid data received from server');
      }
    } catch (err) {
      console.error('PageList: Fetch error:', err);
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out after 10 seconds');
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError('Unknown error occurred');
      }
    } finally {
      setLoading(false);
      console.log('PageList: Fetch completed, loading=false');
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8">
          <div className="animate-pulse mb-4">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500">Loading viktiga sidor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-600 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Debug Information</h3>
          <p className="text-sm mb-2">{error}</p>
          <p className="text-xs text-gray-600">Props: showFeaturedOnly={showFeaturedOnly ? 'true' : 'false'}, limit={limit}</p>
          <button 
            onClick={fetchPages}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
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