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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [navigationPages, setNavigationPages] = useState<NavigationPage[]>([])
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuth()
  
  const isAdminPage = pathname?.startsWith('/admin')

  useEffect(() => {
    // Load pages that should show in navigation
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
    
    loadNavigationPages()
  }, [])

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
            <Link href="/" className="hover:text-vgbf-gold transition-colors">
              Hem
            </Link>
            <Link href="/nyheter" className="hover:text-vgbf-gold transition-colors">
              Nyheter
            </Link>
            <Link href="/tavlingar" className="hover:text-vgbf-gold transition-colors">
              Tävlingar
            </Link>
            <Link href="/klubbar" className="hover:text-vgbf-gold transition-colors">
              Klubbar
            </Link>
            <Link href="/kalender" className="hover:text-vgbf-gold transition-colors">
              Kalender
            </Link>
            <Link href="/distriktsrekord" className="hover:text-vgbf-gold transition-colors">
              Distriktsrekord
            </Link>
            <Link href="/styrelsen" className="hover:text-vgbf-gold transition-colors">
              Styrelsen
            </Link>
            {/* Dynamic navigation pages */}
            {navigationPages.map((page) => (
              <Link 
                key={page.id} 
                href={`/${page.slug}`} 
                className="hover:text-vgbf-gold transition-colors"
              >
                {page.title}
              </Link>
            ))}
            <Link href="/kontakt" className="hover:text-vgbf-gold transition-colors">
              Kontakt
            </Link>
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
              <Link href="/" className="hover:text-vgbf-gold transition-colors">
                Hem
              </Link>
              <Link href="/nyheter" className="hover:text-vgbf-gold transition-colors">
                Nyheter
              </Link>
              <Link href="/tavlingar" className="hover:text-vgbf-gold transition-colors">
                Tävlingar
              </Link>
              <Link href="/klubbar" className="hover:text-vgbf-gold transition-colors">
                Klubbar
              </Link>
              <Link href="/kalender" className="hover:text-vgbf-gold transition-colors">
                Kalender
              </Link>
              <Link href="/distriktsrekord" className="hover:text-vgbf-gold transition-colors">
                Distriktsrekord
              </Link>
              <Link href="/styrelsen" className="hover:text-vgbf-gold transition-colors">
                Styrelsen
              </Link>
              {/* Dynamic navigation pages */}
              {navigationPages.map((page) => (
                <Link 
                  key={page.id} 
                  href={`/${page.slug}`} 
                  className="hover:text-vgbf-gold transition-colors"
                >
                  {page.title}
                </Link>
              ))}
              <Link href="/kontakt" className="hover:text-vgbf-gold transition-colors">
                Kontakt
              </Link>
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
