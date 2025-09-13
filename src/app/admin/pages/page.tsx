'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Page } from '@/app/api/pages/route';

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/pages');
      if (!response.ok) throw new Error('Failed to fetch pages');
      
      const data = await response.json();
      setPages(data.pages);
    } catch (err) {
      setError('Failed to load pages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    
    try {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete page');
      
      setPages(pages.filter(page => page.id !== id));
    } catch (err) {
      setError('Failed to delete page');
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      private: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Manage Pages
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage custom pages for your website
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              href="/admin/pages/new"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Page
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Pages List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {pages.length === 0 ? (
              <li className="px-6 py-8 text-center">
                <div className="text-gray-500">
                  <p className="text-lg">No pages yet</p>
                  <p className="mt-2">Create your first page to get started</p>
                  <Link
                    href="/admin/pages/new"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                  >
                    Create Page
                  </Link>
                </div>
              </li>
            ) : (
              pages.map((page) => (
                <li key={page.id}>
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {page.title}
                        </h3>
                        {getStatusBadge(page.status)}
                        {page.featured && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium rounded-full">
                            Featured
                          </span>
                        )}
                        {page.show_in_navigation && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium rounded-full">
                            In Navigation
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Slug: /{page.slug}</span>
                        <span>Views: {page.view_count}</span>
                        {page.published_at && (
                          <span>
                            Published: {new Date(page.published_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {page.excerpt && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {page.excerpt}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {page.status === 'published' && (
                        <Link
                          href={`/${page.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          View
                        </Link>
                      )}
                      <Link
                        href={`/admin/pages/${page.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deletePage(page.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}