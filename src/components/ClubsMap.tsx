'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Club } from '@/types'

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

if (L) {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface ClubWithCoordinates extends Club {
  lat?: number
  lng?: number
}

interface ClubsMapProps {
  clubs: Club[]
}

// Swedish city coordinates (approximate)
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
  // Missing cities from clubs data
  'Halmstad': { lat: 56.6745, lng: 12.8578 },
  'Lindome': { lat: 57.5833, lng: 12.0833 },
  'Skara': { lat: 58.3867, lng: 13.4408 },
  'Varberg': { lat: 57.1057, lng: 12.2502 }
}

export default function ClubsMap({ clubs }: ClubsMapProps) {
  const [clubsWithCoords, setClubsWithCoords] = useState<ClubWithCoordinates[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Add coordinates to clubs based on their city or existing coordinates
    const enrichedClubs: ClubWithCoordinates[] = clubs.map(club => {
      // Use existing coordinates if available
      if (club.latitude && club.longitude) {
        return {
          ...club,
          lat: club.latitude,
          lng: club.longitude
        }
      }

      // Fallback to city coordinates
      const coords = cityCoordinates[club.city]
      if (coords) {
        // Add small random offset to avoid overlapping markers
        const latOffset = (Math.random() - 0.5) * 0.02
        const lngOffset = (Math.random() - 0.5) * 0.02
        return {
          ...club,
          lat: coords.lat + latOffset,
          lng: coords.lng + lngOffset
        }
      } else {
        console.warn(`Missing coordinates for city: ${club.city} (club: ${club.name})`)
      }
      return club
    })
    
    setClubsWithCoords(enrichedClubs)
  }, [clubs])

  if (!isClient) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Laddar karta...</p>
      </div>
    )
  }

  const validClubs = clubsWithCoords.filter(club => club.lat && club.lng)

  if (validClubs.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">Inga klubbar att visa på kartan</p>
      </div>
    )
  }

  // Center the map on Västra Götaland
  const center: [number, number] = [58.0, 12.5]

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={center}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validClubs.map((club) => (
          club.lat && club.lng && (
            <Marker key={club.id} position={[club.lat, club.lng]}>
              <Popup>
                <div className="p-2 min-w-48">
                  <h3 className="font-bold text-vgbf-blue mb-2">{club.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{club.description}</p>
                  <div className="text-sm space-y-1">
                    <p><strong>Ort:</strong> {club.city}</p>
                    {club.address && <p><strong>Adress:</strong> {club.address}</p>}
                    {club.email && <p><strong>E-post:</strong> {club.email}</p>}
                    {club.phone && <p><strong>Telefon:</strong> {club.phone}</p>}
                    <p><strong>Nya medlemmar:</strong> {club.welcomesNewMembers ? 'Ja' : 'Nej'}</p>
                  </div>
                  <div className="mt-3">
                    <a
                      href={`/klubbar/${club.id}`}
                      className="inline-block bg-vgbf-blue text-white px-3 py-1 rounded text-sm hover:bg-vgbf-green transition-colors"
                    >
                      Läs mer
                    </a>
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
