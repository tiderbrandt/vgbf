import { Club } from '@/types'
import { StorageFactory } from './storage'

// Create storage instance using factory pattern
const clubsStorage = StorageFactory.createAuto<Club>('clubs.json')

// Default clubs data - imported from existing implementation
const defaultClubs: Club[] = [
  {
    id: 'goteborg-bsk',
    name: 'Göteborgs Bågskytteklubb',
    description: 'En av Sveriges äldsta bågskytteklubbar med stark tävlingstradition och välkomnande atmosfär för alla nivåer.',
    location: 'Göteborg',
    email: 'info@gbsk.se',
    phone: '031-123 45 67',
    website: 'https://gbsk.se',
    address: 'Slottsskogsgatan 12',
    postalCode: '413 06',
    city: 'Göteborg',
    established: '1924',
    activities: ['Utomhusbågskytte', 'Inomhusbågskytte', '3D-bågskytte', 'Fältbågskytte', 'Tävlingsverksamhet'],
    facilities: ['Utomhusbana 90m', 'Inomhushall 18m', '3D-bana', 'Klubblokal', 'Verkstad'],
    trainingTimes: [
      { day: 'Måndag', time: '18:00-21:00', type: 'Nybörjarträning' },
      { day: 'Onsdag', time: '17:00-20:00', type: 'Allmän träning' },
      { day: 'Lördag', time: '10:00-15:00', type: 'Tävlingsträning' }
    ],
    memberCount: 180,
    membershipFee: '1200 SEK/år',
    welcomesNewMembers: true,
    facebook: 'https://facebook.com/goteborgsbagskytte'
  },
  {
    id: 'partille-bsk',
    name: 'Partille BSK',
    description: 'Familjevänlig bågskytteklubb med fokus på gemenskap och utveckling för alla åldrar.',
    location: 'Partille',
    email: 'kontakt@partillebsk.se',
    phone: '031-456 78 90',
    website: 'https://partillebsk.se',
    address: 'Furulundsgatan 4',
    postalCode: '433 33',
    city: 'Partille',
    established: '1956',
    activities: ['Utomhusbågskytte', 'Inomhusbågskytte', '3D-bågskytte', 'Fältbågskytte', 'Ungdomsverksamhet'],
    facilities: ['Utomhusbana 70m', 'Inomhushall 18m', '3D-bana i skog', 'Klubblokal', 'Materiallager'],
    trainingTimes: [
      { day: 'Tisdag', time: '18:00-21:00', type: 'Allmän träning' },
      { day: 'Torsdag', time: '17:00-20:00', type: 'Ungdomsträning' },
      { day: 'Söndag', time: '10:00-14:00', type: 'Familjeträning' },
      { day: 'Måndag', time: '18:00 - 19:00', type: 'Prova-På' }
    ],
    memberCount: 142,
    membershipFee: '1100 SEK/år',
    welcomesNewMembers: true,
    facebook: 'https://facebook.com/partillebsk'
  },
  {
    id: 'vanersborg-bk',
    name: 'Vänersborgs BK',
    description: 'Aktiv bågskytteklubb med varierad verksamhet och utmärkta träningsförhållanden.',
    location: 'Vänersborg',
    email: 'info@vanersborgbk.se',
    phone: '0521-234 56 78',
    website: 'https://vanersborgbk.se',
    address: 'Idrottsvägen 8',
    postalCode: '462 32',
    city: 'Vänersborg',
    established: '1978',
    activities: ['Utomhusbågskytte', 'Inomhusbågskytte', 'Fältbågskytte', 'Nybörjarkurser'],
    facilities: ['Utomhusbana 60m', 'Inomhushall 18m', 'Klubblokal', 'Förråd'],
    trainingTimes: [
      { day: 'Måndag', time: '18:00-20:30', type: 'Allmän träning' },
      { day: 'Fredag', time: '17:00-19:00', type: 'Ungdomsträning' }
    ],
    memberCount: 85,
    membershipFee: '950 SEK/år',
    welcomesNewMembers: true,
    facebook: 'https://facebook.com/vanersborgbk'
  }
  // Add more clubs as needed...
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

// Public API functions

/**
 * Get all clubs
 */
export async function getAllClubs(): Promise<Club[]> {
  return await initializeClubsData()
}

/**
 * Get club by ID
 */
export async function getClubById(id: string): Promise<Club | undefined> {
  return await clubsStorage.findOne(club => club.id === id)
}

/**
 * Add a new club
 */
export async function addClub(clubData: Omit<Club, 'id'>): Promise<Club> {
  const newClub: Club = {
    ...clubData,
    id: Date.now().toString()
  }
  
  return await clubsStorage.add(newClub)
}

/**
 * Update an existing club
 */
export async function updateClub(id: string, clubData: Partial<Club>): Promise<Club | null> {
  return await clubsStorage.update(club => club.id === id, clubData)
}

/**
 * Delete a club
 */
export async function deleteClub(id: string): Promise<boolean> {
  return await clubsStorage.delete(club => club.id === id)
}

/**
 * Get clubs by location/city
 */
export async function getClubsByLocation(location: string): Promise<Club[]> {
  const clubs = await getAllClubs()
  return clubs.filter(club => 
    club.city.toLowerCase().includes(location.toLowerCase()) ||
    (club.address && club.address.toLowerCase().includes(location.toLowerCase()))
  )
}

/**
 * Get clubs that welcome new members
 */
export async function getClubsWelcomingNewMembers(): Promise<Club[]> {
  const clubs = await getAllClubs()
  return clubs.filter(club => club.welcomesNewMembers)
}

/**
 * Search clubs by name or activities
 */
export async function searchClubs(query: string): Promise<Club[]> {
  const clubs = await getAllClubs()
  const searchTerm = query.toLowerCase()
  
  return clubs.filter(club =>
    club.name.toLowerCase().includes(searchTerm) ||
    club.activities.some(activity => activity.toLowerCase().includes(searchTerm)) ||
    club.city.toLowerCase().includes(searchTerm)
  )
}
