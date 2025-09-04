import { Club } from '@/types'
import { BlobStorage } from './blob-storage'

// Initialize blob storage for clubs
const clubsStorage = new BlobStorage<Club>('data/clubs.json')

// Default clubs data for Västra Götalands Bågskytteförbund
const defaultClubs: Club[] = [
  {
    id: 'goteborg-bsk',
    name: 'Göteborgs Bågskytteklubb',
    description: 'En av Sveriges äldsta bågskytteklubbar med lång tradition och hög kompetens inom alla grenar av bågskytte.',
    location: 'Göteborg',
    contactPerson: 'Anna Andersson',
    email: 'info@gbsk.se',
    phone: '031-123 45 67',
    website: 'https://gbsk.se',
    address: 'Skyttegatan 10',
    postalCode: '412 34',
    city: 'Göteborg',
    established: '1923',
    activities: ['Utomhusbågskytte', 'Inomhusbågskytte', '3D-bågskytte', 'Fältbågskytte'],
    facilities: ['Utomhusbana 70m', 'Inomhushall 18m', '3D-bana', 'Klubblokal', 'Verkstad'],
    trainingTimes: [
      { day: 'Måndag', time: '18:00-21:00', type: 'Nybörjarträning' },
      { day: 'Onsdag', time: '17:00-20:00', type: 'Allmän träning' },
      { day: 'Lördag', time: '10:00-15:00', type: 'Tävlingsträning' }
    ],
    memberCount: 156,
    membershipFee: '1200 SEK/år',
    welcomesNewMembers: true
  }
  // Add more default clubs as needed
]

// Initialize clubs data if not exists
async function initializeClubsData(): Promise<Club[]> {
  const existingClubs = await clubsStorage.read()
  if (existingClubs.length === 0) {
    console.log('Initializing clubs data with defaults...')
    await clubsStorage.write(defaultClubs)
    return defaultClubs
  }
  return existingClubs
}

// Get all clubs
export async function getAllClubs(): Promise<Club[]> {
  return await initializeClubsData()
}

// Get club by ID
export async function getClubById(id: string): Promise<Club | undefined> {
  return await clubsStorage.findOne(club => club.id === id)
}

// Add a new club
export async function addClub(clubData: Omit<Club, 'id'>): Promise<Club> {
  const newClub: Club = {
    ...clubData,
    id: Date.now().toString()
  }
  
  await clubsStorage.add(newClub)
  return newClub
}

// Update an existing club
export async function updateClub(id: string, clubData: Partial<Club>): Promise<Club | null> {
  return await clubsStorage.update(
    (club) => club.id === id,
    clubData
  )
}

// Delete a club
export async function deleteClub(id: string): Promise<boolean> {
  return await clubsStorage.delete((club) => club.id === id)
}
