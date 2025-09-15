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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
              <div className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
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

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {sponsors.map((sponsor) => (
          <article key={sponsor.id} className="group bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transform transition-all duration-300">
            <div className="p-4">
              {sponsor.logoUrl ? (
                sponsor.website ? (
                  <a 
                    href={sponsor.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block hover:opacity-80 transition-opacity"
                    title={sponsor.name}
                  >
                    <div className="relative w-full h-16 flex items-center justify-center">
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
                    className="relative w-full h-16 flex items-center justify-center"
                    title={sponsor.name}
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
                <div className="h-16 flex items-center justify-center bg-gradient-to-br from-vgbf-blue/5 to-vgbf-green/5 rounded-lg">
                  <span className="text-xl font-bold text-vgbf-blue">{sponsor.name.charAt(0)}</span>
                </div>
              )}
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
