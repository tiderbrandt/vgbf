import fs from 'fs/promises'
import path from 'path'
import { Competition } from '@/types'

// Path to the JSON file where competitions will be stored
const COMPETITIONS_FILE_PATH = path.join(process.cwd(), 'data', 'competitions.json')

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(COMPETITIONS_FILE_PATH)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Default competitions data
const defaultCompetitions: Competition[] = [
  {
    id: '1',
    title: 'Hyundai World Archery Championships',
    description: 'Världsmästerskapet i bågskytte arrangeras av World Archery Federation.',
    date: '2025-09-05',
    registrationDeadline: '2025-08-20',
    organizer: 'World Archery',
    location: 'Berlin, Tyskland',
    status: 'upcoming',
    category: 'outdoor',
    maxParticipants: 500,
    registrationUrl: 'https://worldarchery.sport',
    contactEmail: 'info@worldarchery.sport',
    fee: '2500 SEK',
    equipment: ['Recurve bow', 'Arrows', 'Arm guard', 'Finger tab'],
    rules: 'World Archery Rules gäller. Se hemsidan för fullständiga regler.'
  },
  {
    id: '2',
    title: '3D-SM',
    description: 'Svenska mästerskapet i 3D-bågskytte.',
    date: '2025-09-06',
    registrationDeadline: '2025-08-25',
    organizer: 'Huskvarna BK',
    location: 'Huskvarna',
    status: 'upcoming',
    category: '3d',
    maxParticipants: 200,
    contactEmail: 'info@huskvarnabk.se',
    fee: '400 SEK',
    equipment: ['Alla bågtyper tillåtna', 'Arrows'],
    rules: 'Svenska Bågskytteförbundets 3D-regler gäller.'
  },
  {
    id: '3',
    title: 'DM tavla NSBF utomhus 2025',
    description: 'Distriktsmästerskap tavla utomhus för Norra Svealands Bågskytteförbund.',
    date: '2025-09-13',
    registrationDeadline: '2025-09-01',
    organizer: 'Sigtuna BSK',
    location: 'Sigtuna',
    status: 'upcoming',
    category: 'outdoor',
    maxParticipants: 150,
    contactEmail: 'tavling@sigtunabrsk.se',
    fee: '200 SEK',
    equipment: ['Recurve bow', 'Compound bow', 'Arrows'],
    rules: 'Gällande DM-regler enligt NSBF.'
  },
  {
    id: '4',
    title: 'Distriktsmästerskap 3D',
    description: 'Distriktsmästerskap i 3D-bågskytte som avslutades framgångsrikt.',
    date: '2025-08-31',
    organizer: 'Motala BSK',
    location: 'Motala',
    status: 'completed',
    category: '3d',
    resultsUrl: 'https://results.motalabrsk.se/dm3d2025',
    fee: '350 SEK',
    equipment: ['Alla bågtyper', 'Arrows'],
    rules: 'Svenska Bågskytteförbundets 3D-regler.'
  }
]

// Initialize competitions file with default data if it doesn't exist
async function initializeCompetitionsFile() {
  await ensureDataDirectory()
  
  try {
    await fs.access(COMPETITIONS_FILE_PATH)
    console.log('Competitions file already exists')
  } catch {
    console.log('Creating competitions file with default data')
    await writeCompetitionsToFile(defaultCompetitions)
  }
}

// Read competitions from file
export async function readCompetitionsFromFile(): Promise<Competition[]> {
  try {
    await initializeCompetitionsFile()
    const data = await fs.readFile(COMPETITIONS_FILE_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading competitions file:', error)
    return []
  }
}

// Write competitions to file
export async function writeCompetitionsToFile(competitions: Competition[]): Promise<void> {
  await ensureDataDirectory()
  const data = JSON.stringify(competitions, null, 2)
  await fs.writeFile(COMPETITIONS_FILE_PATH, data, 'utf8')
}

// Add new competition
export async function addCompetition(competitionData: Omit<Competition, 'id'>): Promise<Competition> {
  const competitions = await readCompetitionsFromFile()
  const newCompetition: Competition = {
    ...competitionData,
    id: Date.now().toString(),
  }
  
  competitions.unshift(newCompetition)
  await writeCompetitionsToFile(competitions)
  return newCompetition
}

// Update existing competition
export async function updateCompetition(id: string, competitionData: Partial<Competition>): Promise<Competition | null> {
  const competitions = await readCompetitionsFromFile()
  const index = competitions.findIndex(comp => comp.id === id)
  
  if (index === -1) {
    return null
  }
  
  competitions[index] = { ...competitions[index], ...competitionData }
  await writeCompetitionsToFile(competitions)
  return competitions[index]
}

// Delete competition
export async function deleteCompetition(id: string): Promise<boolean> {
  const competitions = await readCompetitionsFromFile()
  const filteredCompetitions = competitions.filter(comp => comp.id !== id)
  
  if (filteredCompetitions.length === competitions.length) {
    return false // Competition not found
  }
  
  await writeCompetitionsToFile(filteredCompetitions)
  return true
}

// Utility functions for competition management
export async function getAllCompetitions(): Promise<Competition[]> {
  return await readCompetitionsFromFile()
}

export async function getUpcomingCompetitions(): Promise<Competition[]> {
  const competitions = await readCompetitionsFromFile()
  const now = new Date()
  return competitions
    .filter(comp => comp.status === 'upcoming' || (comp.status === 'ongoing' && new Date(comp.date) >= now))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export async function getCompletedCompetitions(): Promise<Competition[]> {
  const competitions = await readCompetitionsFromFile()
  return competitions
    .filter(comp => comp.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getCompetitionById(id: string): Promise<Competition | undefined> {
  const competitions = await readCompetitionsFromFile()
  return competitions.find(comp => comp.id === id)
}

export async function getCompetitionsByCategory(category: Competition['category']): Promise<Competition[]> {
  const competitions = await readCompetitionsFromFile()
  return competitions.filter(comp => comp.category === category)
}

export async function getCompetitionsByStatus(status: Competition['status']): Promise<Competition[]> {
  const competitions = await readCompetitionsFromFile()
  return competitions.filter(comp => comp.status === status)
}
