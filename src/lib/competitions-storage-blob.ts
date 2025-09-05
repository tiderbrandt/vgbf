import { Competition } from '@/types'
import { BlobStorage } from './blob-storage'

// Initialize blob storage for competitions
const competitionsStorage = new BlobStorage<Competition>('data/competitions.json')

// Default competitions data
const defaultCompetitions: Competition[] = [
  {
    id: '1',
    title: 'Vinter DM',
    date: '2024-02-15',
    location: 'Göteborg',
    description: 'Distrikts-mästerskap i inomhusbågskytte',
    category: 'indoor',
    registrationDeadline: '2024-02-01',
    maxParticipants: 120,
    currentParticipants: 0,
    organizer: 'Västra Götalands Bågskytteförbund',
    contactEmail: 'dm@vgbf.se',
    status: 'upcoming',
    rules: 'Tävlingen följer World Archery regler.',
    registrationUrl: 'https://vgbf.se/tavlingar/vinter-dm',
    fee: '300 SEK',
    equipment: ['Recurve', 'Compound', 'Barebow']
  }
]

export async function getAllCompetitions(): Promise<Competition[]> {
  try {
    const competitions = await competitionsStorage.read()
    return competitions.length > 0 ? competitions : defaultCompetitions
  } catch (error) {
    console.error('Error reading competitions from blob storage:', error)
    return defaultCompetitions
  }
}

export async function getUpcomingCompetitions(limit?: number): Promise<Competition[]> {
  const competitions = await getAllCompetitions()
  const now = new Date()
  const upcoming = competitions
    .filter(comp => new Date(comp.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  return limit ? upcoming.slice(0, limit) : upcoming
}

export async function getCompletedCompetitions(limit?: number): Promise<Competition[]> {
  const competitions = await getAllCompetitions()
  const now = new Date()
  const completed = competitions
    .filter(comp => new Date(comp.date) < now || comp.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  return limit ? completed.slice(0, limit) : completed
}

export async function getOngoingCompetitions(): Promise<Competition[]> {
  const competitions = await getAllCompetitions()
  return competitions.filter(comp => comp.status === 'ongoing')
}

export async function getCompetitionById(id: string): Promise<Competition | null> {
  const competitions = await getAllCompetitions()
  return competitions.find(comp => comp.id === id) || null
}

export async function addCompetition(competition: Omit<Competition, 'id'>): Promise<Competition> {
  const competitions = await getAllCompetitions()
  const newCompetition: Competition = {
    ...competition,
    id: Date.now().toString()
  }
  
  competitions.push(newCompetition)
  await competitionsStorage.write(competitions)
  return newCompetition
}

export async function updateCompetition(id: string, updates: Partial<Competition>): Promise<Competition | null> {
  const competitions = await getAllCompetitions()
  const index = competitions.findIndex(comp => comp.id === id)
  
  if (index === -1) {
    return null
  }
  
  competitions[index] = { ...competitions[index], ...updates }
  await competitionsStorage.write(competitions)
  return competitions[index]
}

export async function deleteCompetition(id: string): Promise<boolean> {
  const competitions = await getAllCompetitions()
  const index = competitions.findIndex(comp => comp.id === id)
  
  if (index === -1) {
    return false
  }
  
  competitions.splice(index, 1)
  await competitionsStorage.write(competitions)
  return true
}

export async function getCompetitionsByCategory(category: string): Promise<Competition[]> {
  const competitions = await getAllCompetitions()
  return competitions.filter(comp => comp.category === category)
}

export async function getCompetitionsByDateRange(startDate: string, endDate: string): Promise<Competition[]> {
  const competitions = await getAllCompetitions()
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return competitions.filter(comp => {
    const compDate = new Date(comp.date)
    return compDate >= start && compDate <= end
  })
}
