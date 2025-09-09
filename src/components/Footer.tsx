'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

export default function Footer() {
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

        {/* Copyright */}
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Västra Götalands Bågskytteförbund. Alla rättigheter förbehållna.</p>
          <FooterAdminLink />
        </div>
      </div>
    </footer>
  )
}

function FooterAdminLink() {
  const { isAuthenticated, loading } = useAuth()

  // while loading, don't show anything to avoid layout shift
  if (loading) return null

  return (
    <div className="mt-2">
      {isAuthenticated ? (
        <Link href="/admin" className="text-gray-400 hover:text-vgbf-gold transition-colors" title="Admin area" aria-label="Admin area">Admin</Link>
      ) : (
        <Link href="/admin" className="text-gray-400 hover:text-vgbf-gold transition-colors" title="Logga in" aria-label="Logga in">Logga in</Link>
      )}
    </div>
  )
}
