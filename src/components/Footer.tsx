'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

export default function Footer() {
  return (
    <footer className="bg-vgbf-blue text-white" role="contentinfo" aria-label="Sidfot">
      <div className="container mx-auto px-4 py-12">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
          <nav aria-label="Sidnavigering">
            <h3 className="font-semibold mb-4">Navigering</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-200 hover:text-vgbf-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vgbf-gold rounded">Hem</Link>
              </li>
              <li>
                <Link href="/nyheter" className="text-gray-200 hover:text-vgbf-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vgbf-gold rounded">Nyheter</Link>
              </li>
              <li>
                <Link href="/tavlingar" className="text-gray-200 hover:text-vgbf-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vgbf-gold rounded">Tävlingar</Link>
              </li>
              <li>
                <Link href="/klubbar" className="text-gray-200 hover:text-vgbf-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vgbf-gold rounded">Klubbar</Link>
              </li>
              <li>
                <Link href="/kalender" className="text-gray-200 hover:text-vgbf-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vgbf-gold rounded">Kalender</Link>
              </li>
              <li>
                <Link href="/distriktsrekord" className="text-gray-200 hover:text-vgbf-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vgbf-gold rounded">Distriktsrekord</Link>
              </li>
              <li>
                <Link href="/styrelsen" className="text-gray-200 hover:text-vgbf-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vgbf-gold rounded">Styrelsen</Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-gray-200 hover:text-vgbf-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vgbf-gold rounded">Kontakt</Link>
              </li>
            </ul>
          </nav>

          <div>
            <h3 className="font-semibold mb-4">Snabblänkar</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/kalender" className="text-gray-300 hover:text-vgbf-gold transition-colors">VGBF Kalender</Link></li>
              <li><Link href="/distriktsrekord" className="text-gray-300 hover:text-vgbf-gold transition-colors">Distriktsrekord</Link></li>
              <li><Link href="/tavlingar" className="text-gray-300 hover:text-vgbf-gold transition-colors">Tävlingar</Link></li>
              <li><a href="https://resultat.bagskytte.se/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-vgbf-gold transition-colors">SBF Resultat</a></li>
              <li><a href="https://www.bagskytte.se/" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-vgbf-gold transition-colors">Svenska Bågskytteförbundet</a></li>
            </ul>

            <h3 className="font-semibold mt-6 mb-4">Kontakt</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <div>
                <strong>Postadress:</strong><br />
                Bengt Idéhn<br />
                Änghagsliden 114<br />
                423 49 Torslanda
              </div>
              <div>
                <strong>Telefon:</strong><br />
                <a href="tel:0705463466" className="hover:text-vgbf-gold transition-colors">0705 46 34 66</a>
              </div>
              <div>
                <strong>E-post:</strong><br />
                <a href="mailto:VastraGotalandsBF@bagskytte.se" className="hover:text-vgbf-gold transition-colors">VastraGotalandsBF@bagskytte.se</a>
              </div>
            </div>
          </div>

          <div>
            {/* Social / Extra */}
            <div className="flex items-start md:items-center space-x-4">
              <div className="w-10 h-10 relative flex-shrink-0">
                <Image src="/vgbf-logo.png" alt="VGBF" width={40} height={40} className="object-contain opacity-90" />
              </div>
              <div>
                <p className="text-gray-200 text-sm">Följ oss för senaste uppdateringar</p>
                <div className="flex items-center space-x-3 mt-3">
                  <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-200 hover:text-vgbf-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vgbf-gold rounded">
                    <span className="sr-only">Facebook</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 4.99 3.66 9.12 8.44 9.93v-7.04H8.1v-2.89h2.34V9.41c0-2.32 1.37-3.6 3.46-3.6.99 0 2.03.18 2.03.18v2.23h-1.14c-1.12 0-1.47.7-1.47 1.42v1.71h2.5l-.4 2.89h-2.1v7.04C18.34 21.19 22 17.06 22 12.07z" />
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-200 hover:text-vgbf-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vgbf-gold rounded">
                    <span className="sr-only">Instagram</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm8.5 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM12 7.8A4.2 4.2 0 1012 16.2 4.2 4.2 0 0012 7.8zM12 9.4a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2z" />
                    </svg>
                  </a>
                  <a href="mailto:VastraGotalandsBF@bagskytte.se" aria-label="E-post" className="text-gray-200 hover:text-vgbf-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vgbf-gold rounded">
                    <span className="sr-only">E-post</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Västra Götalands Bågskytteförbund. Alla rättigheter förbehållna.</p>
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
  if (!isAuthenticated) return null

  return (
    <div className="mt-4">
      <Link href="/admin" className="text-sm text-gray-300 hover:text-vgbf-gold transition-colors">Administration</Link>
    </div>
  )
}

