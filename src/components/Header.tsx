'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface NavigationPage {
  id: string;
  title: string;
  slug: string;
  navigation_order: number;
}

interface MenuItem {
  id: string
  title: string
  url: string | null
  target: '_self' | '_blank' | null
  link_type: 'internal' | 'external' | 'page' | 'category'
  is_visible: boolean
  is_published: boolean
  show_on_mobile: boolean
  show_on_desktop: boolean
  children?: MenuItem[]
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [navigationPages, setNavigationPages] = useState<NavigationPage[]>([])
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuth()
  
  const isAdminPage = pathname?.startsWith('/admin')

  useEffect(() => {
    // Load menu items from database
    const loadMenuItems = async () => {
      try {
        const response = await fetch('/api/menus?menu_type=main&published=true&tree=true')
        if (response.ok) {
          const data = await response.json()
          if (data.menuItems && data.menuItems.length > 0) {
            setMenuItems(data.menuItems)
            return // Use database menu items
          }
        }
      } catch (error) {
        console.error('Error loading menu items:', error)
      }
      
      // Fallback to loading navigation pages if menu system isn't available
      loadNavigationPages()
    }

    // Load pages that should show in navigation (fallback for older content)
    const loadNavigationPages = async () => {
      try {
        const response = await fetch('/api/pages?navigation=true&status=published')
        if (response.ok) {
          const data = await response.json()
          const pages = (data.pages || []).sort((a: NavigationPage, b: NavigationPage) => 
            a.navigation_order - b.navigation_order
          )
          setNavigationPages(pages)
        }
      } catch (error) {
        console.error('Error loading navigation pages:', error)
      }
    }
    
    loadMenuItems()
    loadNavigationPages()
  }, [])

  // Helper function to render menu item
  const renderMenuItem = (item: MenuItem, isMobile: boolean = false) => {
    // Don't render if not visible or published
    if (!item.is_visible || !item.is_published) return null
    
    // Check device visibility
    if (isMobile && !item.show_on_mobile) return null
    if (!isMobile && !item.show_on_desktop) return null

    const href = item.url || '#'
    const target = item.target || '_self'
    
    return (
      <Link 
        key={item.id}
        href={href}
        target={target}
        className="hover:text-vgbf-gold transition-colors"
      >
        {item.title}
      </Link>
    )
  }

  return (
    <header className="bg-vgbf-blue text-white shadow-lg header-with-logo-bg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center space-x-4 hover:opacity-90 transition-opacity">
            <div className="w-12 h-12 relative">
              <Image
                src="/vgbf-logo.png"
                alt="VGBF Logo"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">Västra Götalands</h1>
              <h2 className="text-sm">Bågskytteförbund</h2>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 items-center">
            {/* Dynamic menu items from database */}
            {menuItems.map((item) => renderMenuItem(item, false))}
            
            {/* Fallback: Dynamic navigation pages from legacy system */}
            {menuItems.length === 0 && navigationPages.map((page) => (
              <Link 
                key={page.id} 
                href={`/${page.slug}`} 
                className="hover:text-vgbf-gold transition-colors"
              >
                {page.title}
              </Link>
            ))}
            
            {isAdminPage && isAuthenticated && (
              <button
                onClick={logout}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
              >
                Logga ut
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {/* Dynamic menu items from database */}
              {menuItems.map((item) => renderMenuItem(item, true))}
              
              {/* Fallback: Dynamic navigation pages from legacy system */}
              {menuItems.length === 0 && navigationPages.map((page) => (
                <Link 
                  key={page.id} 
                  href={`/${page.slug}`} 
                  className="hover:text-vgbf-gold transition-colors"
                >
                  {page.title}
                </Link>
              ))}
              
              {isAdminPage && isAuthenticated && (
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm mt-2"
                >
                  Logga ut
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
