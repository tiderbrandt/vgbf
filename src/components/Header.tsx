'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-vgbf-blue text-white shadow-lg">
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
          <nav className="hidden md:flex space-x-6">
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
            <Link href="/kontakt" className="hover:text-vgbf-gold transition-colors">
              Kontakt
            </Link>
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
              <Link href="/kontakt" className="hover:text-vgbf-gold transition-colors">
                Kontakt
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
