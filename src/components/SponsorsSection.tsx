"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sponsor } from '@/types'

export default function SponsorsSection() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSponsors()
  }, [])

  const loadSponsors = async () => {
    try {
      const response = await fetch('/api/sponsors')
      if (response.ok) {
        const data = await response.json()
        // Only show active sponsors, sorted by priority
        const activeSponsors = data.data
          .filter((sponsor: Sponsor) => sponsor.isActive)
          .sort((a: Sponsor, b: Sponsor) => a.priority - b.priority)
        setSponsors(activeSponsors)
      }
    } catch (error) {
      console.error('Error loading sponsors:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-vgbf-blue mb-6">Våra Sponsorer</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (sponsors.length === 0) {
    return null
  }

  return (
    <div>
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-vgbf-blue mb-6">
          Våra Sponsorer
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Vi tackar våra partners som stödjer Västra Götalands Bågskytteförbund
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsors.map((sponsor) => (
          <article key={sponsor.id} className="group bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-2 transform transition-all duration-300">
            <div className="p-6">
              {sponsor.logoUrl ? (
                sponsor.website ? (
                  <a 
                    href={sponsor.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block hover:opacity-80 transition-opacity"
                    title={sponsor.description || sponsor.name}
                  >
                    <div className="relative w-full h-24 mb-4 flex items-center justify-center">
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
                    className="relative w-full h-24 mb-4 flex items-center justify-center"
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
                <div className="h-24 mb-4 flex items-center justify-center bg-gradient-to-br from-vgbf-blue/5 to-vgbf-green/5 rounded-lg">
                  <span className="text-2xl font-bold text-vgbf-blue">{sponsor.name.charAt(0)}</span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl font-bold text-vgbf-blue mb-3 group-hover:text-vgbf-green transition-colors duration-200 leading-tight">{sponsor.name}</h3>
                {sponsor.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{sponsor.description}</p>
                )}
                
                <div className="flex items-center justify-center pt-2 border-t border-gray-100">
                  {sponsor.website ? (
                    <a
                      href={sponsor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-vgbf-blue font-semibold hover:text-vgbf-green transition-colors duration-200 group/link"
                    >
                      Besök webbplats
                      <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-sm text-gray-500">Partner</span>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 text-lg mb-4">
          Intresserad av att stödja bågskyttet i Västra Götaland?
        </p>
        <a
          href="/kontakt"
          className="inline-flex items-center gap-1 text-vgbf-blue font-semibold hover:text-vgbf-green transition-colors duration-200 group/link"
        >
          Kontakta oss om sponsring
          <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  )
}
