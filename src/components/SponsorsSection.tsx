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
      <div className="max-w-2xl mx-auto text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (sponsors.length === 0) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-3xl font-bold text-vgbf-blue mb-4">Våra Sponsorer</h2>
      <p className="text-gray-600 text-lg mb-8">
        Vi tackar våra partners som stödjer Västra Götalands Bågskytteförbund och utvecklingen av bågskyttet i regionen.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center justify-items-center">
        {sponsors.map((sponsor) => (
          <div key={sponsor.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300 w-full max-w-sm">
            {sponsor.logoUrl ? (
              sponsor.website ? (
                <a 
                  href={sponsor.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:opacity-80 transition-opacity"
                  title={sponsor.description || sponsor.name}
                >
                  <div className="relative w-full h-24 mb-4">
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
                  className="relative w-full h-24 mb-4"
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
              <div className="h-24 mb-4 flex items-center justify-center bg-gray-100 rounded">
                <span className="text-xl font-bold text-gray-400">{sponsor.name.charAt(0)}</span>
              </div>
            )}

            <div className="text-center">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{sponsor.name}</h3>
              {sponsor.description && (
                <p className="text-sm text-gray-600 mb-3">{sponsor.description}</p>
              )}
              {sponsor.website && (
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-vgbf-blue hover:underline"
                >
                  Besök webbplats
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm mb-4">
          Intresserad av att stödja bågskyttet i Västra Götaland?
        </p>
        <a
          href="/kontakt"
          className="inline-flex items-center px-6 py-3 bg-vgbf-blue text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Kontakta oss om sponsring
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  )
}
