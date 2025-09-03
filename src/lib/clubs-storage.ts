import { Club } from '@/types'
import { promises as fs } from 'fs'
import path from 'path'

const CLUBS_FILE_PATH = path.join(process.cwd(), 'data', 'clubs.json')

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
    welcomesNewMembers: true,
    facebook: 'https://facebook.com/gbsk',
    instagram: '@gbsk_official'
  },
  {
    id: 'trollhattan-bsk',
    name: 'Trollhättans Bågskytteklubb',
    description: 'Aktiv bågskytteklubb med fokus på ungdomsverksamhet och utveckling av nya skyttar.',
    location: 'Trollhättan',
    contactPerson: 'Erik Eriksson',
    email: 'kontakt@trollhattanbsk.se',
    phone: '0520-98 76 54',
    website: 'https://trollhattanbsk.se',
    address: 'Sportvägen 5',
    postalCode: '461 32',
    city: 'Trollhättan',
    established: '1956',
    activities: ['Utomhusbågskytte', 'Inomhusbågskytte', 'Ungdomsträning'],
    facilities: ['Utomhusbana 50m', 'Inomhushall 20m', 'Klubblokal'],
    trainingTimes: [
      { day: 'Tisdag', time: '17:30-20:00', type: 'Ungdomsträning' },
      { day: 'Torsdag', time: '18:00-21:00', type: 'Vuxenträning' },
      { day: 'Söndag', time: '10:00-14:00', type: 'Familjeträning' }
    ],
    memberCount: 89,
    membershipFee: '950 SEK/år',
    welcomesNewMembers: true,
    facebook: 'https://facebook.com/trollhattanbsk'
  },
  {
    id: 'boras-bsk',
    name: 'Borås Bågskytteklubb',
    description: 'Modern bågskytteklubb med utmärkta faciliteter och bred verksamhet för alla åldrar.',
    location: 'Borås',
    contactPerson: 'Maria Månsson',
    email: 'info@borasbsk.org',
    phone: '033-45 67 89',
    website: 'https://borasbsk.org',
    address: 'Idrottsvägen 15',
    postalCode: '503 38',
    city: 'Borås',
    established: '1967',
    activities: ['Utomhusbågskytte', 'Inomhusbågskytte', '3D-bågskytte', 'Traditionellt bågskytte'],
    facilities: ['Utomhusbana 90m', 'Inomhushall 25m', '3D-bana', 'Traditionell bana', 'Restaurang'],
    trainingTimes: [
      { day: 'Måndag', time: '18:00-20:30', type: 'Compound/Recurve' },
      { day: 'Onsdag', time: '17:00-20:00', type: 'Traditionellt' },
      { day: 'Fredag', time: '16:00-19:00', type: 'Ungdom' },
      { day: 'Lördag', time: '09:00-12:00', type: '3D-träning' }
    ],
    memberCount: 134,
    membershipFee: '1100 SEK/år',
    welcomesNewMembers: true,
    instagram: '@boras_bsk'
  },
  {
    id: 'varberg-bsk',
    name: 'Varbergs Bågskytteklubb',
    description: 'Kustens bågskytteklubb med vacker miljö och välkomnande atmosfär för alla nivåer.',
    location: 'Varberg',
    contactPerson: 'Johan Johansson',
    email: 'varbergbsk@gmail.com',
    phone: '0340-12 34 56',
    address: 'Strandvägen 42',
    postalCode: '432 41',
    city: 'Varberg',
    established: '1978',
    activities: ['Utomhusbågskytte', 'Inomhusbågskytte', 'Fältbågskytte'],
    facilities: ['Utomhusbana 70m', 'Inomhushall 18m', 'Fältbana'],
    trainingTimes: [
      { day: 'Tisdag', time: '18:30-21:00', type: 'Allmän träning' },
      { day: 'Lördag', time: '10:00-13:00', type: 'Fältträning' }
    ],
    memberCount: 67,
    membershipFee: '800 SEK/år',
    welcomesNewMembers: true
  },
  {
    id: 'uddevalla-bsk',
    name: 'Uddevalla Bågskytteklubb',
    description: 'Familjär klubb med stark gemenskap och gedigen utbildning för nybörjare.',
    location: 'Uddevalla',
    contactPerson: 'Lena Lindqvist',
    email: 'info@uddevallabsk.se',
    phone: '0522-34 56 78',
    address: 'Klubbgatan 8',
    postalCode: '451 50',
    city: 'Uddevalla',
    established: '1984',
    activities: ['Utomhusbågskytte', 'Inomhusbågskytte', 'Nybörjarutbildning'],
    facilities: ['Utomhusbana 60m', 'Inomhushall 20m', 'Klubbstuga'],
    trainingTimes: [
      { day: 'Onsdag', time: '17:00-20:00', type: 'Allmän träning' },
      { day: 'Söndag', time: '11:00-15:00', type: 'Nybörjarträning' }
    ],
    memberCount: 43,
    membershipFee: '700 SEK/år',
    welcomesNewMembers: true
  },
  {
    id: 'skovde-bsk',
    name: 'Skövde Bågskytteklubb',
    description: 'Centralt belägen klubb med moderna anläggningar och aktiv tävlingsverksamhet.',
    location: 'Skövde',
    contactPerson: 'Anders Karlsson',
    email: 'kontakt@skovdebsk.se',
    phone: '0500-87 65 43',
    website: 'https://skovdebsk.se',
    address: 'Sportgatan 23',
    postalCode: '541 34',
    city: 'Skövde',
    established: '1971',
    activities: ['Utomhusbågskytte', 'Inomhusbågskytte', 'Tävlingsverksamhet'],
    facilities: ['Utomhusbana 70m', 'Inomhushall 18m', 'Tävlingslokal'],
    trainingTimes: [
      { day: 'Måndag', time: '18:00-21:00', type: 'Tävlingsträning' },
      { day: 'Torsdag', time: '17:30-20:30', type: 'Allmän träning' }
    ],
    memberCount: 98,
    membershipFee: '1000 SEK/år',
    welcomesNewMembers: true,
    facebook: 'https://facebook.com/skovdebsk'
  }
]

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(CLUBS_FILE_PATH)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Create clubs file with default data if it doesn't exist
async function ensureClubsFile() {
  try {
    await fs.access(CLUBS_FILE_PATH)
    console.log('Clubs file already exists')
  } catch {
    console.log('Creating clubs file with default data')
    await ensureDataDirectory()
    await fs.writeFile(CLUBS_FILE_PATH, JSON.stringify(defaultClubs, null, 2))
  }
}

// Read all clubs
export async function getClubs(): Promise<Club[]> {
  try {
    await ensureClubsFile()
    const data = await fs.readFile(CLUBS_FILE_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading clubs:', error)
    return defaultClubs
  }
}

// Get club by ID
export async function getClubById(id: string): Promise<Club | null> {
  const clubs = await getClubs()
  return clubs.find(club => club.id === id) || null
}

// Save clubs
export async function saveClubs(clubs: Club[]): Promise<void> {
  await ensureDataDirectory()
  await fs.writeFile(CLUBS_FILE_PATH, JSON.stringify(clubs, null, 2))
}

// Add new club
export async function addClub(club: Omit<Club, 'id'>): Promise<Club> {
  const clubs = await getClubs()
  const newClub: Club = {
    ...club,
    id: Date.now().toString()
  }
  clubs.push(newClub)
  await saveClubs(clubs)
  return newClub
}

// Update club
export async function updateClub(id: string, updates: Partial<Omit<Club, 'id'>>): Promise<Club | null> {
  const clubs = await getClubs()
  const index = clubs.findIndex(club => club.id === id)
  
  if (index === -1) {
    return null
  }
  
  clubs[index] = { ...clubs[index], ...updates }
  await saveClubs(clubs)
  return clubs[index]
}

// Delete club
export async function deleteClub(id: string): Promise<boolean> {
  const clubs = await getClubs()
  const filteredClubs = clubs.filter(club => club.id !== id)
  
  if (filteredClubs.length === clubs.length) {
    return false // Club not found
  }
  
  await saveClubs(filteredClubs)
  return true
}

// Filter clubs by location/city
export async function getClubsByLocation(location: string): Promise<Club[]> {
  const clubs = await getClubs()
  return clubs.filter(club => 
    club.location.toLowerCase().includes(location.toLowerCase()) ||
    club.city.toLowerCase().includes(location.toLowerCase())
  )
}

// Get clubs that welcome new members
export async function getClubsWelcomingNewMembers(): Promise<Club[]> {
  const clubs = await getClubs()
  return clubs.filter(club => club.welcomesNewMembers)
}
