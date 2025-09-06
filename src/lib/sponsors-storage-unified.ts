import { Sponsor } from '@/types'
import { StorageFactory } from './storage'

// Create storage instance using factory pattern
const sponsorsStorage = StorageFactory.createAuto<Sponsor>('data/sponsors.json')

// Default sponsors data - imported from existing implementation
const defaultSponsors: Sponsor[] = [
  {
    id: '1',
    name: 'Consid Sverige AB',
    description: 'Konsultbolag inom IT och digitalisering som stödjer svensk bågskytte.',
    logoUrl: '/uploads/sponsors/1756975495715-5rsvt4-consid-se-logo-2.png',
    website: 'https://consid.se',
    priority: 1,
    isActive: true,
    addedDate: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Stora Enso',
    description: 'Skogsindustriföretag som bidrar till hållbar utveckling inom bågskytte.',
    logoUrl: '/uploads/sponsors/stora-enso-logo.png',
    website: 'https://storaenso.com',
    priority: 2,
    isActive: true,
    addedDate: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'Göteborgs Stad',
    description: 'Göteborgs kommun stödjer idrottsverksamhet och ungdomsarbete.',
    logoUrl: '/uploads/sponsors/goteborg-stad-logo.png',
    website: 'https://goteborg.se',
    priority: 3,
    isActive: true,
    addedDate: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
]

// Initialize sponsors data if not exists
async function initializeSponsorsData(): Promise<Sponsor[]> {
  const existingSponsors = await sponsorsStorage.read()
  if (existingSponsors.length === 0) {
    console.log('Initializing sponsors data with defaults...')
    await sponsorsStorage.write(defaultSponsors)
    return defaultSponsors
  }
  return existingSponsors
}

// Public API functions

/**
 * Get all sponsors (sorted by priority, then by name)
 */
export async function getAllSponsors(): Promise<Sponsor[]> {
  const sponsors = await initializeSponsorsData()
  // Sort by priority (lower number = higher priority), then by name
  return sponsors.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority - b.priority
    }
    return a.name.localeCompare(b.name)
  })
}

/**
 * Get active sponsors only
 */
export async function getActiveSponsors(): Promise<Sponsor[]> {
  const allSponsors = await getAllSponsors()
  return allSponsors.filter(sponsor => sponsor.isActive)
}

/**
 * Get sponsor by ID
 */
export async function getSponsorById(id: string): Promise<Sponsor | undefined> {
  return await sponsorsStorage.findOne(sponsor => sponsor.id === id)
}

/**
 * Add a new sponsor
 */
export async function addSponsor(sponsorData: Omit<Sponsor, 'id'>): Promise<Sponsor> {
  const now = new Date().toISOString()
  const newSponsor: Sponsor = {
    ...sponsorData,
    id: Date.now().toString(),
    addedDate: now,
    updatedAt: now
  }
  
  return await sponsorsStorage.add(newSponsor)
}

/**
 * Update an existing sponsor
 */
export async function updateSponsor(id: string, sponsorData: Partial<Sponsor>): Promise<Sponsor | null> {
  const now = new Date().toISOString()
  const updatedData = {
    ...sponsorData,
    updatedAt: now
  }
  
  return await sponsorsStorage.update(sponsor => sponsor.id === id, updatedData)
}

/**
 * Delete a sponsor
 */
export async function deleteSponsor(id: string): Promise<boolean> {
  return await sponsorsStorage.delete(sponsor => sponsor.id === id)
}

/**
 * Get sponsors by priority range
 */
export async function getSponsorsByPriorityRange(minPriority: number, maxPriority: number): Promise<Sponsor[]> {
  const sponsors = await getAllSponsors()
  return sponsors.filter(sponsor => 
    sponsor.priority >= minPriority && sponsor.priority <= maxPriority
  )
}

/**
 * Search sponsors by name or description
 */
export async function searchSponsors(query: string): Promise<Sponsor[]> {
  const sponsors = await getAllSponsors()
  const searchTerm = query.toLowerCase()
  
  return sponsors.filter(sponsor =>
    sponsor.name.toLowerCase().includes(searchTerm) ||
    sponsor.description?.toLowerCase().includes(searchTerm)
  )
}

/**
 * Get recently added sponsors (by addedDate)
 */
export async function getRecentlyAddedSponsors(limit: number = 5): Promise<Sponsor[]> {
  const sponsors = await getAllSponsors()
  return sponsors
    .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
    .slice(0, limit)
}

/**
 * Get recently updated sponsors (by updatedAt)
 */
export async function getRecentlyUpdatedSponsors(limit: number = 5): Promise<Sponsor[]> {
  const sponsors = await getAllSponsors()
  return sponsors
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit)
}
