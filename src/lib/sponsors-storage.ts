import { promises as fs } from 'fs'
import path from 'path'
import { Sponsor } from '@/types'

const SPONSORS_FILE = path.join(process.cwd(), 'data', 'sponsors.json')

export async function getAllSponsors(): Promise<Sponsor[]> {
  try {
    const data = await fs.readFile(SPONSORS_FILE, 'utf8')
    const sponsors: Sponsor[] = JSON.parse(data)
    // Sort by priority (lower number = higher priority), then by name
    return sponsors.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      return a.name.localeCompare(b.name)
    })
  } catch (error) {
    console.error('Error reading sponsors file:', error)
    return []
  }
}

export async function getActiveSponsors(): Promise<Sponsor[]> {
  const allSponsors = await getAllSponsors()
  return allSponsors.filter(sponsor => sponsor.isActive)
}

export async function getSponsorById(id: string): Promise<Sponsor | null> {
  const sponsors = await getAllSponsors()
  return sponsors.find(sponsor => sponsor.id === id) || null
}

export async function saveSponsor(sponsor: Sponsor): Promise<void> {
  const sponsors = await getAllSponsors()
  const existingIndex = sponsors.findIndex(s => s.id === sponsor.id)
  
  const now = new Date().toISOString()
  const sponsorWithTimestamp = {
    ...sponsor,
    updatedAt: now,
    addedDate: existingIndex >= 0 ? sponsors[existingIndex].addedDate : now
  }
  
  if (existingIndex >= 0) {
    sponsors[existingIndex] = sponsorWithTimestamp
  } else {
    sponsors.push(sponsorWithTimestamp)
  }
  
  await fs.writeFile(SPONSORS_FILE, JSON.stringify(sponsors, null, 2))
}

export async function deleteSponsor(id: string): Promise<boolean> {
  const sponsors = await getAllSponsors()
  const filteredSponsors = sponsors.filter(sponsor => sponsor.id !== id)
  
  if (filteredSponsors.length === sponsors.length) {
    return false // Sponsor not found
  }
  
  await fs.writeFile(SPONSORS_FILE, JSON.stringify(filteredSponsors, null, 2))
  return true
}

export function generateSponsorId(name: string): string {
  const cleanName = name
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  const timestamp = Date.now()
  return `${cleanName}-${timestamp}`
}
