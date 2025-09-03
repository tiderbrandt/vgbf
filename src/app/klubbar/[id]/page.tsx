'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Club } from '@/types'

type Props = {
  params: { id: string }
}

export default function ClubDetailPage({ params }: Props) {
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClub()
  }, [params.id])

  const loadClub = async () => {
    try {
      const response = await fetch(`/api/clubs?id=${params.id}`)
      const data = await response.json()
      if (data.success) {
        setClub(data.data)
      } else {
        notFound()
      }
    } catch (error) {
      console.error('Error loading club:', error)
      notFound()
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vgbf-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Laddar klubbinformation...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!club) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="bg-vgbf-blue text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <nav className="mb-6">
              <Link href="/klubbar" className="text-blue-200 hover:text-white transition-colors">
                ← Tillbaka till alla klubbar
              </Link>
            </nav>
            
            <div className="grid md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-2">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{club.name}</h1>
                <p className="text-xl text-blue-100 mb-6">{club.description}</p>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-blue-100">
                    <span>📍</span>
                    <span>{club.city}</span>
                  </div>
                  
                  {club.established && (
                    <div className="flex items-center gap-2 text-blue-100">
                      <span>📅</span>
                      <span>Grundad {club.established}</span>
                    </div>
                  )}
                  
                  {club.memberCount && (
                    <div className="flex items-center gap-2 text-blue-100">
                      <span>👥</span>
                      <span>{club.memberCount} medlemmar</span>
                    </div>
                  )}
                </div>
              </div>
              
              {club.imageUrl && (
                <div className="order-first md:order-last">
                  <Image
                    src={club.imageUrl}
                    alt={club.imageAlt || club.name}
                    width={300}
                    height={200}
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-8">
              
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-vgbf-blue mb-4">Kontaktinformation</h2>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-vgbf-blue">📧</span>
                    <div>
                      <div className="font-medium">E-post</div>
                      <a href={`mailto:${club.email}`} className="text-vgbf-blue hover:underline">
                        {club.email}
                      </a>
                    </div>
                  </div>
                  
                  {club.phone && (
                    <div className="flex items-start gap-3">
                      <span className="text-vgbf-blue">📞</span>
                      <div>
                        <div className="font-medium">Telefon</div>
                        <a href={`tel:${club.phone}`} className="text-vgbf-blue hover:underline">
                          {club.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {club.contactPerson && (
                    <div className="flex items-start gap-3">
                      <span className="text-vgbf-blue">👤</span>
                      <div>
                        <div className="font-medium">Kontaktperson</div>
                        <div className="text-gray-600">{club.contactPerson}</div>
                      </div>
                    </div>
                  )}
                  
                  {(club.address || club.postalCode) && (
                    <div className="flex items-start gap-3">
                      <span className="text-vgbf-blue">🏠</span>
                      <div>
                        <div className="font-medium">Adress</div>
                        <div className="text-gray-600">
                          {club.address && <div>{club.address}</div>}
                          {club.postalCode && <div>{club.postalCode} {club.city}</div>}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {club.website && (
                    <div className="flex items-start gap-3">
                      <span className="text-vgbf-blue">🌐</span>
                      <div>
                        <div className="font-medium">Hemsida</div>
                        <a 
                          href={club.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-vgbf-blue hover:underline"
                        >
                          {club.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Social Media */}
                {(club.facebook || club.instagram) && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="font-medium mb-3">Sociala medier</div>
                    <div className="flex gap-4">
                      {club.facebook && (
                        <a
                          href={club.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Facebook
                        </a>
                      )}
                      {club.instagram && (
                        <a
                          href={`https://instagram.com/${club.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700"
                        >
                          {club.instagram}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Membership */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-vgbf-blue mb-4">Medlemskap</h2>
                
                <div className="space-y-4">
                  {club.welcomesNewMembers ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                        <span>✅</span>
                        <span>Välkomnar nya medlemmar</span>
                      </div>
                      <p className="text-green-700 text-sm">
                        Denna klubb tar gärna emot nya medlemmar och hjälper dig komma igång med bågskytte.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="text-yellow-800 font-medium">
                        Kontakta klubben för information om medlemskap
                      </div>
                    </div>
                  )}
                  
                  {club.membershipFee && (
                    <div>
                      <div className="font-medium">Medlemsavgift</div>
                      <div className="text-gray-600">{club.membershipFee}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              
              {/* Activities */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-vgbf-blue mb-4">Aktiviteter</h2>
                <div className="flex flex-wrap gap-2">
                  {club.activities.map((activity, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Training Times */}
              {club.trainingTimes && club.trainingTimes.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-vgbf-blue mb-4">Träningstider</h2>
                  <div className="space-y-3">
                    {club.trainingTimes.map((training, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <div className="font-medium">{training.day}</div>
                          {training.type && (
                            <div className="text-sm text-gray-600">{training.type}</div>
                          )}
                        </div>
                        <div className="text-vgbf-blue font-medium">{training.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Facilities */}
              {club.facilities && club.facilities.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-vgbf-blue mb-4">Anläggningar</h2>
                  <ul className="space-y-2">
                    {club.facilities.map((facility, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-vgbf-green">•</span>
                        <span>{facility}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 bg-vgbf-green text-white rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Intresserad av att bli medlem?</h2>
            <p className="text-green-100 mb-6">
              Kontakta {club.name} direkt för mer information om medlemskap och hur du kommer igång.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href={`mailto:${club.email}`}
                className="bg-white text-vgbf-green px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Skicka e-post
              </a>
              {club.phone && (
                <a
                  href={`tel:${club.phone}`}
                  className="bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
                >
                  Ring nu
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
