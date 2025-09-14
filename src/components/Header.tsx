'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface MenuItem {
  id: string
  title: string
  url: string
  target: '_self' | '_blank'
  children?: MenuItem[]
}

// Static navigation structure
const staticNavigation: MenuItem[] = [
  {
    id: 'home',
    title: 'Hem',
    url: '/',
    target: '_self'
  },
  {
    id: 'news',
    title: 'Nyheter',
    url: '/nyheter',
    target: '_self'
  },
  {
    id: 'clubs',
    title: 'Klubbar',
    url: '/klubbar',
    target: '_self'
  },
  {
    id: 'competitions',
    title: 'Tävlingar',
    url: '/tavlingar',
    target: '_self'
  },
  {
    id: 'records',
    title: 'Distriktsrekord',
    url: '/distriktsrekord',
    target: '_self'
  },
  {
    id: 'board',
    title: 'Styrelsen',
    url: '/styrelsen',
    target: '_self'
  }
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, logout } = useAuth()
  
  const isAdminPage = pathname?.startsWith('/admin')

  // Helper function to render menu item
  const renderMenuItem = (item: MenuItem, isMobile: boolean = false) => {
    const isActive = pathname === item.url
    
    return (
      <Link
        key={item.id}
        href={item.url}
        target={item.target}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'text-vgbf-blue bg-blue-50'
            : 'text-gray-700 hover:text-vgbf-blue hover:bg-gray-50'
        }`}
        onClick={() => isMobile && setIsMenuOpen(false)}
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
            {/* Static navigation items */}
            {staticNavigation.map((item) => renderMenuItem(item, false))}
            
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
              {/* Static navigation items */}
              {staticNavigation.map((item) => renderMenuItem(item, true))}
              
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
