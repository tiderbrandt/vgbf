import { Competition } from '@/types'
import { StorageFactory } from './storage'

// Create storage instance using factory pattern
const competitionsStorage = StorageFactory.createAuto<Competition>('competitions.json')

// Default competitions data - imported from existing implementation
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
    date: '2025-07-12',
    registrationDeadline: '2025-06-30',
    organizer: 'Svenska Bågskytteförbundet',
    location: 'Växjö',
    status: 'upcoming',
    category: '3d',
    maxParticipants: 200,
    registrationUrl: 'https://svenskbagskyte.se',
    contactEmail: 'sm@svenskbagskyte.se',
    fee: '800 SEK',
    equipment: ['Alla bågtyper tillåtna', 'Arrows', 'Field points'],
    rules: 'Svenska Bågskytteförbundets 3D-regler gäller.'
  },
  {
    id: '3',
    title: 'Göteborgs Stads Mästerskap',
    description: 'Årliga mästerskapet för Göteborgs stad.',
    date: '2025-06-15',
    registrationDeadline: '2025-06-01',
    organizer: 'Göteborgs Bågskytteklubb',
    location: 'Göteborg',
    status: 'upcoming',
    category: 'outdoor',
    maxParticipants: 150,
    registrationUrl: 'https://gbsk.se/tavlingar',
    contactEmail: 'tavling@gbsk.se',
    fee: '400 SEK',
    equipment: ['Recurve bow', 'Compound bow', 'Arrows'],
    rules: 'Svenska Bågskytteförbundets standardregler.'
  },
  {
    id: '4',
    title: 'VGBF Vintercup',
    description: 'Vintercupen för Västra Götalands Bågskytteförbund.',
    date: '2025-02-20',
    registrationDeadline: '2025-02-10',
    organizer: 'VGBF',
    location: 'Borås',
    status: 'upcoming',
    category: 'indoor',
    maxParticipants: 100,
    registrationUrl: 'https://vgbf.se/vintercup',
    contactEmail: 'vgbf.info@gmail.com',
    fee: '300 SEK',
    equipment: ['Alla bågtyper', 'Indoor arrows'],
    rules: 'VGBF:s tävlingsregler för inomhustävlingar.'
  }
]

// Initialize competitions data if not exists
async function initializeCompetitionsData(): Promise<Competition[]> {
  const existingCompetitions = await competitionsStorage.read()
  if (existingCompetitions.length === 0) {
    console.log('Initializing competitions data with defaults...')
    await competitionsStorage.write(defaultCompetitions)
    return defaultCompetitions
  }
  return existingCompetitions
}

// Public API functions

/**
 * Get all competitions
 */
export async function getAllCompetitions(): Promise<Competition[]> {
  return await initializeCompetitionsData()
}

/**
 * Get competition by ID
 */
export async function getCompetitionById(id: string): Promise<Competition | undefined> {
  return await competitionsStorage.findOne(competition => competition.id === id)
}

/**
 * Add a new competition
 */
export async function addCompetition(competitionData: Omit<Competition, 'id'>): Promise<Competition> {
  const newCompetition: Competition = {
    ...competitionData,
    id: Date.now().toString()
  }
  
  return await competitionsStorage.add(newCompetition)
}

/**
 * Update an existing competition
 */
export async function updateCompetition(id: string, competitionData: Partial<Competition>): Promise<Competition | null> {
  return await competitionsStorage.update(competition => competition.id === id, competitionData)
}

/**
 * Delete a competition
 */
export async function deleteCompetition(id: string): Promise<boolean> {
  return await competitionsStorage.delete(competition => competition.id === id)
}

/**
 * Get upcoming competitions
 */
export async function getUpcomingCompetitions(): Promise<Competition[]> {
  const competitions = await getAllCompetitions()
  const now = new Date()
  return competitions
    .filter(comp => new Date(comp.date) > now || comp.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

/**
 * Get past competitions
 */
export async function getPastCompetitions(): Promise<Competition[]> {
  const competitions = await getAllCompetitions()
  const now = new Date()
  return competitions
    .filter(comp => new Date(comp.date) <= now && comp.status !== 'upcoming')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Get competitions by status
 */
export async function getCompetitionsByStatus(status: string): Promise<Competition[]> {
  const competitions = await getAllCompetitions()
  return competitions.filter(comp => comp.status === status)
}

/**
 * Get competitions by category
 */
export async function getCompetitionsByCategory(category: string): Promise<Competition[]> {
  const competitions = await getAllCompetitions()
  return competitions.filter(comp => comp.category === category)
}

/**
 * Get competitions by organizer
 */
export async function getCompetitionsByOrganizer(organizer: string): Promise<Competition[]> {
  const competitions = await getAllCompetitions()
  return competitions.filter(comp => 
    comp.organizer.toLowerCase().includes(organizer.toLowerCase())
  )
}

/**
 * Search competitions by title, description, location, or organizer
 */
export async function searchCompetitions(query: string): Promise<Competition[]> {
  const competitions = await getAllCompetitions()
  const searchTerm = query.toLowerCase()
  
  return competitions.filter(comp =>
    comp.title.toLowerCase().includes(searchTerm) ||
    comp.description.toLowerCase().includes(searchTerm) ||
    comp.location.toLowerCase().includes(searchTerm) ||
    comp.organizer.toLowerCase().includes(searchTerm)
  )
}

/**
 * Get competitions with open registration
 */
export async function getCompetitionsWithOpenRegistration(): Promise<Competition[]> {
  const competitions = await getAllCompetitions()
  const now = new Date()
  
  return competitions.filter(comp => {
    const registrationDeadline = new Date(comp.registrationDeadline)
    return registrationDeadline > now && comp.status === 'upcoming'
  })
}

/**
 * Get competitions by date range
 */
export async function getCompetitionsByDateRange(startDate: string, endDate: string): Promise<Competition[]> {
  const competitions = await getAllCompetitions()
  return competitions.filter(comp => {
    const competitionDate = new Date(comp.date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return competitionDate >= start && competitionDate <= end
  })
}
