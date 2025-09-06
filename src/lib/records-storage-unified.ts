import { DistrictRecord } from '@/types'
import { StorageFactory } from './storage'

// Create storage instance using factory pattern
const recordsStorage = StorageFactory.createAuto<DistrictRecord>('records.json')

// Default records data based on common Swedish archery categories
const defaultRecords: DistrictRecord[] = [
  // Utomhus SBF 70m/60m/50m/40m/30m 72/15 pilar
  {
    id: '1',
    category: 'Utomhus SBF 70m/60m/50m/40m/30m 72/15 pilar',
    class: 'Herrar Recurve',
    name: 'Anders Andersson',
    club: 'Göteborg BK',
    score: '675',
    date: '2024-06-15',
    competition: 'Västkustmästerskapet',
    competitionUrl: 'https://resultat.bagskytte.se/competitions/2024/vastkust',
    organizer: 'Göteborg BK'
  },
  {
    id: '2',
    category: 'Utomhus SBF 70m/60m/50m/40m/30m 72/15 pilar',
    class: 'Damer Recurve',
    name: 'Maria Persson',
    club: 'Borås BS',
    score: '628',
    date: '2024-07-20',
    competition: 'VGBF DM Utomhus',
    competitionUrl: 'https://resultat.bagskytte.se/competitions/2024/vgbf-dm',
    organizer: 'VGBF'
  },
  {
    id: '3',
    category: 'Utomhus SBF 70m/60m/50m/40m/30m 72/15 pilar',
    class: 'Herrar Compound',
    name: 'Erik Johansson',
    club: 'Trollhättan BK',
    score: '702',
    date: '2024-08-10',
    competition: 'Svenska Cupen',
    competitionUrl: 'https://resultat.bagskytte.se/competitions/2024/svenska-cupen',
    organizer: 'Svenska Bågskytteförbundet'
  },
  {
    id: '4',
    category: 'Utomhus SBF 70m/60m/50m/40m/30m 72/15 pilar',
    class: 'Damer Compound',
    name: 'Lisa Karlsson',
    club: 'Göteborgs BS',
    score: '689',
    date: '2024-05-25',
    competition: 'Nationella Cupen',
    competitionUrl: 'https://resultat.bagskytte.se/competitions/2024/nationella-cupen',
    organizer: 'Svenska Bågskytteförbundet'
  },
  // Inomhus 18m 30 pilar
  {
    id: '5',
    category: 'Inomhus 18m 30 pilar',
    class: 'Herrar Recurve',
    name: 'Magnus Lindberg',
    club: 'Skövde BK',
    score: '287',
    date: '2024-02-18',
    competition: 'VGBF Vintercup',
    competitionUrl: 'https://resultat.bagskytte.se/competitions/2024/vintercup',
    organizer: 'VGBF'
  },
  {
    id: '6',
    category: 'Inomhus 18m 30 pilar',
    class: 'Damer Recurve',
    name: 'Anna Svensson',
    club: 'Alingsås BK',
    score: '275',
    date: '2024-01-20',
    competition: 'Inomhus DM',
    competitionUrl: 'https://resultat.bagskytte.se/competitions/2024/inomhus-dm',
    organizer: 'VGBF'
  },
  // 3D-klasser
  {
    id: '7',
    category: '3D 24 mål',
    class: 'Herrar Barebow',
    name: 'Johan Holm',
    club: 'Varberg BK',
    score: '432',
    date: '2024-09-15',
    competition: '3D-SM',
    competitionUrl: 'https://resultat.bagskytte.se/competitions/2024/3d-sm',
    organizer: 'Svenska Bågskytteförbundet'
  },
  {
    id: '8',
    category: '3D 24 mål',
    class: 'Damer Barebow',
    name: 'Emma Nilsson',
    club: 'Uddevalla BK',
    score: '398',
    date: '2024-08-22',
    competition: 'VGBF 3D-Cup',
    competitionUrl: 'https://resultat.bagskytte.se/competitions/2024/3d-cup',
    organizer: 'VGBF'
  },
  // Ungdomsklasser
  {
    id: '9',
    category: 'Utomhus SBF 60m/50m/40m/30m 36/15 pilar',
    class: 'Pojkar 16-17 Recurve',
    name: 'Oskar Lundqvist',
    club: 'Kungsbacka BK',
    score: '624',
    date: '2024-07-08',
    competition: 'Ungdoms-SM',
    competitionUrl: 'https://resultat.bagskytte.se/competitions/2024/ungdoms-sm',
    organizer: 'Svenska Bågskytteförbundet'
  },
  {
    id: '10',
    category: 'Utomhus SBF 60m/50m/40m/30m 36/15 pilar',
    class: 'Flickor 16-17 Recurve',
    name: 'Elin Gustafsson',
    club: 'Halmstad BK',
    score: '598',
    date: '2024-06-30',
    competition: 'Västra Regionen Ungdom',
    competitionUrl: 'https://resultat.bagskytte.se/competitions/2024/vastra-ungdom',
    organizer: 'VGBF'
  }
]

// Initialize records data if not exists
async function initializeRecordsData(): Promise<DistrictRecord[]> {
  const existingRecords = await recordsStorage.read()
  if (existingRecords.length === 0) {
    console.log('Initializing records data with defaults...')
    await recordsStorage.write(defaultRecords)
    return defaultRecords
  }
  return existingRecords
}

// Public API functions

/**
 * Get all records
 */
export async function getAllRecords(): Promise<DistrictRecord[]> {
  return await initializeRecordsData()
}

/**
 * Get record by ID
 */
export async function getRecordById(id: string): Promise<DistrictRecord | undefined> {
  return await recordsStorage.findOne(record => record.id === id)
}

/**
 * Add a new record
 */
export async function addRecord(recordData: Omit<DistrictRecord, 'id'>): Promise<DistrictRecord> {
  const newRecord: DistrictRecord = {
    ...recordData,
    id: Date.now().toString()
  }
  
  return await recordsStorage.add(newRecord)
}

/**
 * Update an existing record
 */
export async function updateRecord(id: string, recordData: Partial<DistrictRecord>): Promise<DistrictRecord | null> {
  return await recordsStorage.update(record => record.id === id, recordData)
}

/**
 * Delete a record
 */
export async function deleteRecord(id: string): Promise<boolean> {
  return await recordsStorage.delete(record => record.id === id)
}

/**
 * Get records by category
 */
export async function getRecordsByCategory(category: string): Promise<DistrictRecord[]> {
  const records = await getAllRecords()
  return records.filter(record => record.category === category)
}

/**
 * Get records by class
 */
export async function getRecordsByClass(recordClass: string): Promise<DistrictRecord[]> {
  const records = await getAllRecords()
  return records.filter(record => record.class === recordClass)
}

/**
 * Get records by club
 */
export async function getRecordsByClub(club: string): Promise<DistrictRecord[]> {
  const records = await getAllRecords()
  return records.filter(record => 
    record.club.toLowerCase().includes(club.toLowerCase())
  )
}

/**
 * Search records by name, club, competition, or organizer
 */
export async function searchRecords(query: string): Promise<DistrictRecord[]> {
  const records = await getAllRecords()
  const searchTerm = query.toLowerCase()
  
  return records.filter(record =>
    record.name.toLowerCase().includes(searchTerm) ||
    record.club.toLowerCase().includes(searchTerm) ||
    record.competition.toLowerCase().includes(searchTerm) ||
    record.organizer.toLowerCase().includes(searchTerm)
  )
}

/**
 * Get records by date range
 */
export async function getRecordsByDateRange(startDate: string, endDate: string): Promise<DistrictRecord[]> {
  const records = await getAllRecords()
  return records.filter(record => {
    const recordDate = new Date(record.date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return recordDate >= start && recordDate <= end
  })
}

/**
 * Get latest records (most recent by date)
 */
export async function getLatestRecords(limit: number = 10): Promise<DistrictRecord[]> {
  const records = await getAllRecords()
  return records
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

/**
 * Get records grouped by category
 */
export async function getRecordsGroupedByCategory(): Promise<{ [category: string]: DistrictRecord[] }> {
  const records = await getAllRecords()
  const grouped: { [category: string]: DistrictRecord[] } = {}
  
  records.forEach(record => {
    if (!grouped[record.category]) {
      grouped[record.category] = []
    }
    grouped[record.category].push(record)
  })
  
  return grouped
}

/**
 * Get highest score in category and class
 */
export async function getHighestScoreInClass(category: string, recordClass: string): Promise<DistrictRecord | undefined> {
  const records = await getAllRecords()
  const filtered = records.filter(record => 
    record.category === category && record.class === recordClass
  )
  
  if (filtered.length === 0) return undefined
  
  return filtered.reduce((highest, current) => {
    const currentScore = parseInt(current.score)
    const highestScore = parseInt(highest.score)
    return currentScore > highestScore ? current : highest
  })
}
