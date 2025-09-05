import { Sponsor } from '@/types'
import { BlobStorage } from './blob-storage'

// Initialize blob storage for sponsors
const sponsorsStorage = new BlobStorage<Sponsor>('data/sponsors.json')

// Default sponsors data
const defaultSponsors: Sponsor[] = [
  {
    id: '1',
    name: 'Consid AB',
    description: 'IT-konsultföretag som stödjer bågskytte',
    website: 'https://consid.se',
    logoUrl: '/uploads/sponsors/consid-logo.png',
    logoAlt: 'Consid AB logotyp',
    priority: 1,
    isActive: true,
    addedDate: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export async function getAllSponsors(): Promise<Sponsor[]> {
  try {
    const sponsors = await sponsorsStorage.read()
    return sponsors.length > 0 ? sponsors : defaultSponsors
  } catch (error) {
    console.error('Error reading sponsors from blob storage:', error)
    return defaultSponsors
  }
}

export async function getActiveSponsors(): Promise<Sponsor[]> {
  const sponsors = await getAllSponsors()
  return sponsors
    .filter(sponsor => sponsor.isActive)
    .sort((a, b) => a.priority - b.priority)
}

export async function getSponsorById(id: string): Promise<Sponsor | null> {
  const sponsors = await getAllSponsors()
  return sponsors.find(sponsor => sponsor.id === id) || null
}

export async function saveSponsor(sponsor: Omit<Sponsor, 'id' | 'addedDate' | 'updatedAt'>): Promise<Sponsor> {
  const sponsors = await getAllSponsors()
  const now = new Date().toISOString()
  const newSponsor: Sponsor = {
    ...sponsor,
    id: Date.now().toString(),
    addedDate: now,
    updatedAt: now
  }
  
  sponsors.push(newSponsor)
  await sponsorsStorage.write(sponsors)
  return newSponsor
}

export async function updateSponsor(id: string, updates: Partial<Sponsor>): Promise<Sponsor | null> {
  const sponsors = await getAllSponsors()
  const index = sponsors.findIndex(sponsor => sponsor.id === id)
  
  if (index === -1) {
    return null
  }
  
  sponsors[index] = { 
    ...sponsors[index], 
    ...updates,
    updatedAt: new Date().toISOString()
  }
  await sponsorsStorage.write(sponsors)
  return sponsors[index]
}

export async function deleteSponsor(id: string): Promise<boolean> {
  const sponsors = await getAllSponsors()
  const index = sponsors.findIndex(sponsor => sponsor.id === id)
  
  if (index === -1) {
    return false
  }
  
  sponsors.splice(index, 1)
  await sponsorsStorage.write(sponsors)
  return true
}

export function generateSponsorId(): string {
  return Date.now().toString()
}

export async function reorderSponsors(sponsorIds: string[]): Promise<boolean> {
  const sponsors = await getAllSponsors()
  
  // Update priorities based on the order
  sponsorIds.forEach((id, index) => {
    const sponsor = sponsors.find(s => s.id === id)
    if (sponsor) {
      sponsor.priority = index + 1
      sponsor.updatedAt = new Date().toISOString()
    }
  })
  
  await sponsorsStorage.write(sponsors)
  return true
}
