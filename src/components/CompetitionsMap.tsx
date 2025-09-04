'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Competition } from '@/types'

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
)

// Fix for default markers in Next.js
const L = typeof window !== 'undefined' ? require('leaflet') : null

// Load Leaflet CSS dynamically
if (typeof window !== 'undefined' && L) {
  // Only load Leaflet CSS when component is used
  if (!document.querySelector('link[href*="leaflet.css"]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css'
    document.head.appendChild(link)
  }

  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface CompetitionWithCoordinates extends Competition {
  lat?: number
  lng?: number
}

interface CompetitionsMapProps {
  competitions: Competition[]
}

// City coordinates including some locations outside Västra Götaland for competitions
const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
  'Göteborg': { lat: 57.7089, lng: 11.9746 },
  'Borås': { lat: 57.7210, lng: 12.9401 },
  'Trollhättan': { lat: 58.2836, lng: 12.2886 },
  'Uddevalla': { lat: 58.3478, lng: 11.9424 },
  'Skövde': { lat: 58.3911, lng: 13.8453 },
  'Mariestad': { lat: 58.7097, lng: 13.8236 },
  'Vänersborg': { lat: 58.3804, lng: 12.3234 },
  'Lidköping': { lat: 58.5052, lng: 13.1574 },
  'Alingsås': { lat: 57.9304, lng: 12.5349 },
  'Lerum': { lat: 57.7706, lng: 12.2689 },
  'Mölndal': { lat: 57.6554, lng: 12.0134 },
  'Partille': { lat: 57.7393, lng: 12.1063 },
  'Stenungsund': { lat: 58.0705, lng: 11.8182 },
  'Kungälv': { lat: 57.8703, lng: 11.9800 },
  'Lysekil': { lat: 58.2742, lng: 11.4351 },
  'Strömstad': { lat: 58.9357, lng: 11.1766 },
  'Tibro': { lat: 58.4252, lng: 12.5167 },
  'Vara': { lat: 58.2610, lng: 12.9508 },
  'Grästorp': { lat: 58.3419, lng: 12.7968 },
  'Essunga': { lat: 58.1733, lng: 12.6417 },
  'Karlsborg': { lat: 58.5361, lng: 14.5069 },
  'Gullspång': { lat: 58.9833, lng: 14.1167 },
  'Tranemo': { lat: 57.4877, lng: 13.3402 },
  'Bengtsfors': { lat: 59.0276, lng: 12.2297 },
  'Mellerud': { lat: 58.6998, lng: 12.4526 },
  'Lilla Edet': { lat: 58.1333, lng: 12.1333 },
  'Mark': { lat: 57.4917, lng: 12.7000 },
  'Svenljunga': { lat: 57.4967, lng: 13.1067 },
  'Herrljunga': { lat: 58.0833, lng: 13.0333 },
  'Vårgårda': { lat: 58.0333, lng: 12.8167 },
  'Bollebygd': { lat: 57.6667, lng: 12.5667 },
  'Töreboda': { lat: 58.7000, lng: 14.1167 },
  'Götene': { lat: 58.5500, lng: 13.4167 },
  // Additional cities for competitions outside Västra Götaland
  'Stockholm': { lat: 59.3293, lng: 18.0686 },
  'Berlin': { lat: 52.5200, lng: 13.4050 },
  'Sigtuna': { lat: 59.6171, lng: 17.7290 },
  'Motala': { lat: 58.5370, lng: 15.0366 },
  'Malmö': { lat: 55.6059, lng: 13.0007 },
  'Uppsala': { lat: 59.8586, lng: 17.6389 },
  'Linköping': { lat: 58.4108, lng: 15.6214 },
  'Örebro': { lat: 59.2741, lng: 15.2066 },
  'Växjö': { lat: 56.8777, lng: 14.8091 },
  'Karlstad': { lat: 59.3793, lng: 13.5036 }
}

// Function to extract city from location string
const extractCityFromLocation = (location: string): string => {
  // Handle formats like "Berlin, Tyskland", "Motala", "Sigtuna Bågskytte"
  const parts = location.split(',')
  let city = parts[0].trim()
  
  // Remove common suffixes
  city = city.replace(/\s+(BS|BSK|Bågskytte|Bågskyttesällskap|Bågskytteklubb)$/i, '').trim()
  
  return city
}

export default function CompetitionsMap({ competitions }: CompetitionsMapProps) {
  const [competitionsWithCoords, setCompetitionsWithCoords] = useState<CompetitionWithCoordinates[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Add coordinates to competitions based on their location
    const enrichedCompetitions: CompetitionWithCoordinates[] = competitions.map(competition => {
      const city = extractCityFromLocation(competition.location)
      const coords = cityCoordinates[city]
      
      if (coords) {
        // Add small random offset to avoid overlapping markers
        const latOffset = (Math.random() - 0.5) * 0.02
        const lngOffset = (Math.random() - 0.5) * 0.02
        return {
          ...competition,
          lat: coords.lat + latOffset,
          lng: coords.lng + lngOffset
        }
      }
      return competition
    })
    
    setCompetitionsWithCoords(enrichedCompetitions)
  }, [competitions])

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Laddar karta...</p>
      </div>
    )
  }

  const validCompetitions = competitionsWithCoords.filter(competition => competition.lat && competition.lng)

  if (validCompetitions.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Inga tävlingar att visa på kartan</p>
      </div>
    )
  }

  // Center the map on Sweden (wider view to include competitions outside Västra Götaland)
  const center: [number, number] = [59.0, 15.0]

  const getStatusColor = (status: Competition['status']): string => {
    switch (status) {
      case 'upcoming': return '#3B82F6' // blue
      case 'ongoing': return '#10B981' // green
      case 'completed': return '#6B7280' // gray
      default: return '#6B7280'
    }
  }

  const getCategoryIcon = (category: Competition['category']): string => {
    switch (category) {
      case 'outdoor': return '🏹'
      case 'indoor': return '🎯'
      case '3d': return '🌲'
      case 'field': return '🏞️'
      default: return '📍'
    }
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validCompetitions.map((competition) => (
          competition.lat && competition.lng && (
            <Marker key={competition.id} position={[competition.lat, competition.lng]}>
              <Popup>
                <div className="p-2 min-w-48">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xl">{getCategoryIcon(competition.category)}</span>
                    <div>
                      <h3 className="font-bold text-vgbf-blue mb-1">{competition.title}</h3>
                      <div className="flex gap-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          competition.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          competition.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {competition.status === 'upcoming' ? 'Kommande' :
                           competition.status === 'ongoing' ? 'Pågående' : 'Avslutad'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          competition.category === 'outdoor' ? 'bg-green-100 text-green-800' :
                          competition.category === 'indoor' ? 'bg-purple-100 text-purple-800' :
                          competition.category === '3d' ? 'bg-orange-100 text-orange-800' :
                          competition.category === 'field' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {competition.category === 'outdoor' ? 'Utomhus' :
                           competition.category === 'indoor' ? 'Inomhus' :
                           competition.category === '3d' ? '3D' :
                           competition.category === 'field' ? 'Fält' : 'Övrigt'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{competition.description}</p>
                  <div className="text-sm space-y-1">
                    <p><strong>Datum:</strong> {new Date(competition.date).toLocaleDateString('sv-SE')}</p>
                    <p><strong>Plats:</strong> {competition.location}</p>
                    <p><strong>Arrangör:</strong> {competition.organizer}</p>
                    {competition.fee && <p><strong>Avgift:</strong> {competition.fee}</p>}
                    {competition.registrationDeadline && (
                      <p><strong>Anmälan senast:</strong> {new Date(competition.registrationDeadline).toLocaleDateString('sv-SE')}</p>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    {competition.registrationUrl && (
                      <a
                        href={competition.registrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-vgbf-blue text-white px-3 py-1 rounded text-sm hover:bg-vgbf-green transition-colors"
                      >
                        Anmäl
                      </a>
                    )}
                    {competition.resultsUrl && (
                      <a
                        href={competition.resultsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors"
                      >
                        Resultat
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  )
}
