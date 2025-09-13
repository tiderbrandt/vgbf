'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Page } from '@/app/api/pages/route';

interface PageFormProps {
  pageId?: string;
  mode: 'create' | 'edit';
}

export default function PageForm({ pageId, mode }: PageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    author: '',
    status: 'draft' as 'draft' | 'published' | 'private',
    featured_image: '',
    featured_image_alt: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    template: 'default',
    show_in_navigation: false,
    navigation_order: 0,
    featured: false
  });

  useEffect(() => {
    if (mode === 'edit' && pageId) {
      fetchPage();
    }
  }, [mode, pageId]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pages/${pageId}`);
      if (!response.ok) throw new Error('Failed to fetch page');
      
      const page: Page = await response.json();
      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content,
        excerpt: page.excerpt || '',
        author: page.author || '',
        status: page.status,
        featured_image: page.featured_image || '',
        featured_image_alt: page.featured_image_alt || '',
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        meta_keywords: page.meta_keywords || '',
        template: page.template || 'default',
        show_in_navigation: page.show_in_navigation,
        navigation_order: page.navigation_order,
        featured: page.featured
      });
    } catch (err) {
      setError('Failed to load page');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = async () => {
    if (!formData.title) return;
    
    try {
      const response = await fetch('/api/pages/generate-slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: formData.title,
          excludeId: pageId 
        })
      });
      
      if (response.ok) {
        const { slug } = await response.json();
        setFormData(prev => ({ ...prev, slug }));
      }
    } catch (err) {
      console.error('Failed to generate slug:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = mode === 'create' ? '/api/pages' : `/api/pages/${pageId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save page');
      }

      router.push('/admin/pages');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save page');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (loading && mode === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                {mode === 'create' ? 'Create New Page' : 'Edit Page'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {mode === 'create' 
                  ? 'Create a new custom page for your website'
                  : 'Edit the existing page content and settings'
                }
              </p>
            </div>
            <Link
              href="/admin/pages"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Pages
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Basic Information
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  The main content and identification for your page.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      onBlur={generateSlug}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                      URL Slug *
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        /
                      </span>
                      <input
                        type="text"
                        name="slug"
                        id="slug"
                        required
                        value={formData.slug}
                        onChange={handleChange}
                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                      Excerpt
                    </label>
                    <textarea
                      name="excerpt"
                      id="excerpt"
                      rows={3}
                      value={formData.excerpt}
                      onChange={handleChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Brief description of the page..."
                    />
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                      Content *
                    </label>
                    <textarea
                      name="content"
                      id="content"
                      rows={15}
                      required
                      value={formData.content}
                      onChange={handleChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Page content in HTML format..."
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      You can use HTML tags for formatting. Images will be uploaded to Cloudinary.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Publishing Options */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Publishing
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Control how and when your page is published.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-3">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="status"
                      id="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="private">Private</option>
                    </select>
                  </div>

                  <div className="col-span-3">
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                      Author
                    </label>
                    <input
                      type="text"
                      name="author"
                      id="author"
                      value={formData.author}
                      onChange={handleChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>

                  <div className="col-span-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="featured"
                          name="featured"
                          type="checkbox"
                          checked={formData.featured}
                          onChange={handleChange}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="featured" className="font-medium text-gray-700">
                          Featured page
                        </label>
                        <p className="text-gray-500">This page will be highlighted on the website.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Navigation
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Control if and how this page appears in site navigation.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="show_in_navigation"
                          name="show_in_navigation"
                          type="checkbox"
                          checked={formData.show_in_navigation}
                          onChange={handleChange}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="show_in_navigation" className="font-medium text-gray-700">
                          Show in navigation
                        </label>
                        <p className="text-gray-500">Include this page in the main website navigation.</p>
                      </div>
                    </div>
                  </div>

                  {formData.show_in_navigation && (
                    <div className="col-span-3">
                      <label htmlFor="navigation_order" className="block text-sm font-medium text-gray-700">
                        Navigation Order
                      </label>
                      <input
                        type="number"
                        name="navigation_order"
                        id="navigation_order"
                        min="0"
                        value={formData.navigation_order}
                        onChange={handleChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  SEO & Meta
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Search engine optimization and social media settings.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6">
                    <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="meta_title"
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={handleChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="SEO title (defaults to page title)"
                    />
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">
                      Meta Description
                    </label>
                    <textarea
                      name="meta_description"
                      id="meta_description"
                      rows={3}
                      value={formData.meta_description}
                      onChange={handleChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Description for search engines..."
                    />
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="meta_keywords" className="block text-sm font-medium text-gray-700">
                      Keywords
                    </label>
                    <input
                      type="text"
                      name="meta_keywords"
                      id="meta_keywords"
                      value={formData.meta_keywords}
                      onChange={handleChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Comma-separated keywords..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Link
              href="/admin/pages"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Page' : 'Update Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}