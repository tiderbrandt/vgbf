'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sponsor } from '@/types'

export default function Footer() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])

  useEffect(() => {
    loadSponsors()
  }, [])

  const loadSponsors = async () => {
    try {
      const response = await fetch('/api/sponsors')
      const data = await response.json()
      if (data.success) {
        // Only show active sponsors
        setSponsors(data.data.filter((sponsor: Sponsor) => sponsor.isActive))
      }
    } catch (error) {
      console.error('Error loading sponsors:', error)
    }
  }

  return (
    <footer className="bg-vgbf-blue text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Organization Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 relative">
                <Image
                  src="/vgbf-logo.png"
                  alt="VGBF Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="font-bold">VGBF</span>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Västra Götalands Bågskytteförbund är distriktsförbundet för bågskyttet i Västra Götaland.
            </p>
            <p className="text-gray-300 text-sm">
              Organisationsnr: 857500-2954
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-4">Navigering</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-300 hover:text-vgbf-gold transition-colors">Hem</Link></li>
              <li><Link href="/nyheter" className="text-gray-300 hover:text-vgbf-gold transition-colors">Nyheter</Link></li>
              <li><Link href="/tavlingar" className="text-gray-300 hover:text-vgbf-gold transition-colors">Tävlingar</Link></li>
              <li><Link href="/klubbar" className="text-gray-300 hover:text-vgbf-gold transition-colors">Klubbar</Link></li>
              <li><Link href="/kalender" className="text-gray-300 hover:text-vgbf-gold transition-colors">Kalender</Link></li>
              <li><Link href="/distriktsrekord" className="text-gray-300 hover:text-vgbf-gold transition-colors">Distriktsrekord</Link></li>
              <li><Link href="/styrelsen" className="text-gray-300 hover:text-vgbf-gold transition-colors">Styrelsen</Link></li>
              <li><Link href="/kontakt" className="text-gray-300 hover:text-vgbf-gold transition-colors">Kontakt</Link></li>
              {/* Administration link intentionally moved to the bottom copyright area */}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Snabblänkar</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/kalender" className="text-gray-300 hover:text-vgbf-gold transition-colors">VGBF Kalender</Link></li>
              <li><Link href="/distriktsrekord" className="text-gray-300 hover:text-vgbf-gold transition-colors">Distriktsrekord</Link></li>
              <li><Link href="/tavlingar" className="text-gray-300 hover:text-vgbf-gold transition-colors">Tävlingar</Link></li>
              <li><a href="https://resultat.bagskytte.se/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-vgbf-gold transition-colors">SBF Resultat</a></li>
              <li><a href="https://www.bagskytte.se/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-vgbf-gold transition-colors">Svenska Bågskytteförbundet</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Kontakt</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <div>
                <strong>Postadress:</strong><br />
                Bengt Idéhn<br />
                Änghagsliden 114<br />
                423 49 Torslanda
              </div>
              <div>
                <strong>Besöksadress:</strong><br />
                Via Teams
              </div>
              <div>
                <strong>Telefon:</strong><br />
                0705 46 34 66
              </div>
              <div>
                <strong>E-post:</strong><br />
                <a href="mailto:VastraGotalandsBF@bagskytte.se" className="hover:text-vgbf-gold transition-colors">
                  VastraGotalandsBF@bagskytte.se
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsors */}
        {sponsors.length > 0 && (
          <div className="border-t border-gray-600 mt-8 pt-8 pb-4 bg-gray-100 rounded-lg mx-4">
            <h3 className="font-bold text-xl mb-1 text-center text-gray-800">Sponsorer</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {sponsors.map((sponsor) => (
                <div key={sponsor.id} className="flex items-center">
                  {sponsor.logoUrl ? (
                    sponsor.website ? (
                      <a 
                        href={sponsor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block hover:opacity-80 transition-opacity"
                        title={sponsor.description || sponsor.name}
                      >
                        <div className="relative w-40 h-40">
                          <Image
                            src={sponsor.logoUrl}
                            alt={sponsor.logoAlt || sponsor.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </a>
                    ) : (
                      <div 
                        className="relative w-40 h-40"
                        title={sponsor.description || sponsor.name}
                      >
                        <Image
                          src={sponsor.logoUrl}
                          alt={sponsor.logoAlt || sponsor.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )
                  ) : (
                    // Fallback for sponsors without logos - show name as text
                    sponsor.website ? (
                      <a 
                        href={sponsor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-vgbf-gold hover:text-yellow-400 transition-colors text-sm"
                        title={sponsor.description || sponsor.name}
                      >
                        {sponsor.name}
                      </a>
                    ) : (
                      <span 
                        className="text-vgbf-gold text-sm"
                        title={sponsor.description || sponsor.name}
                      >
                        {sponsor.name}
                      </span>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Copyright */}
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Västra Götalands Bågskytteförbund. Alla rättigheter förbehållna.</p>
          <div className="mt-2">
            <Link href="/admin" className="text-gray-400 hover:text-vgbf-gold transition-colors" title="Administration (admin)" aria-label="Administration">
              Administration
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
