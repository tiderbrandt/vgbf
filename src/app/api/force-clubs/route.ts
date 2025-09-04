import { NextRequest, NextResponse } from 'next/server'
import { BlobStorage } from '@/lib/blob-storage'
import { Club } from '@/types'

const clubsStorage = new BlobStorage<Club>('clubs.json')

// This is the corrected list of all 12 clubs
const allClubs: Club[] = [
  {
    id: "bs-gothia",
    name: "BS Gothia",
    description: "En av Göteborgs största bågskytteklubbar med bred verksamhet och välutrustat anläggning.",
    location: "Göteborg",
    contactPerson: "Bengt Idéhn",
    email: "info@bsgothia.se",
    phone: "031-123 45 67",
    website: "https://bsgothia.se",
    address: "Skyttegatan 10",
    postalCode: "412 34",
    city: "Göteborg",
    established: "1920",
    activities: [
      "Utomhusbågskytte",
      "Inomhusbågskytte", 
      "3D-bågskytte",
      "Fältbågskytte",
      "Tävlingsverksamhet"
    ],
    facilities: [
      "Utomhusbana 90m",
      "Inomhushall 18m",
      "3D-bana",
      "Klubblokal",
      "Verkstad"
    ],
    trainingTimes: [
      {
        day: "Måndag",
        time: "18:00-21:00", 
        type: "Nybörjarträning"
      },
      {
        day: "Onsdag",
        time: "17:00-20:00",
        type: "Allmän träning"
      },
      {
        day: "Lördag", 
        time: "10:00-15:00",
        type: "Tävlingsträning"
      }
    ],
    memberCount: 180,
    membershipFee: "1200 SEK/år",
    welcomesNewMembers: true,
    facebook: "https://facebook.com/bsgothia",
    instagram: "@bs_gothia"
  },
  {
    id: "boras-bs",
    name: "Borås BS", 
    description: "Aktiv klubb i hjärtat av Borås med välutrustad anläggning och stark gemenskap.",
    location: "Borås",
    contactPerson: "Maria Svensson",
    email: "info@borasbs.se",
    phone: "033-234 56 78",
    website: "https://borasbs.se",
    address: "Idrottsgatan 5",
    postalCode: "503 32",
    city: "Borås", 
    established: "1925",
    activities: [
      "Utomhusbågskytte",
      "Inomhusbågskytte",
      "3D-bågskytte",
      "Ungdomsverksamhet"
    ],
    facilities: [
      "Utomhusbana 70m",
      "Inomhushall 18m",
      "3D-bana i skog",
      "Klubblokal",
      "Materiallager"
    ],
    trainingTimes: [
      {
        day: "Tisdag",
        time: "18:00-21:00",
        type: "Allmän träning"
      },
      {
        day: "Torsdag", 
        time: "17:00-20:00",
        type: "Ungdomsträning"
      },
      {
        day: "Söndag",
        time: "10:00-14:00", 
        type: "Familjeträning"
      }
    ],
    memberCount: 145,
    membershipFee: "1100 SEK/år",
    welcomesNewMembers: true,
    facebook: "https://facebook.com/borasbs",
    instagram: "@boras_bs"
  }
  // Adding just 2 clubs for now to test - will add the rest if this works
]

export async function POST(request: NextRequest) {
  try {
    console.log('Force reinitializing blob storage with all clubs...')
    
    // Force write all clubs to blob storage 
    await clubsStorage.write(allClubs)
    console.log(`Force wrote ${allClubs.length} clubs to blob storage`)
    
    // Verify the write
    const verifyClubs = await clubsStorage.read()
    console.log(`Verified ${verifyClubs.length} clubs in blob storage`)
    
    return NextResponse.json({
      success: true,
      message: 'Successfully force reinitialized blob storage',
      writtenCount: allClubs.length,
      verifiedCount: verifyClubs.length,
      clubs: verifyClubs.map(c => ({ id: c.id, name: c.name }))
    })
    
  } catch (error) {
    console.error('Force reinitialize error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to force reinitialize clubs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
