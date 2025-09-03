import fs from 'fs/promises'
import path from 'path'
import { DistrictRecord } from '@/types'

const RECORDS_FILE_PATH = path.join(process.cwd(), 'data', 'records.json')

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(RECORDS_FILE_PATH)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

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
    name: 'Lars Johansson',
    club: 'Uddevalla BK',
    score: '702',
    date: '2024-05-12',
    competition: 'Göta Cup',
    competitionUrl: 'https://resultat.bagskytte.se/competitions/2024/gota-cup',
    organizer: 'Göteborgs BSK'
  },
  
  // Inomhus SBF 18m/12m 15 pilar
  {
    id: '4',
    category: 'Inomhus SBF 18m/12m 15 pilar',
    class: 'Herrar Recurve',
    name: 'Erik Nilsson',
    club: 'Trollhättan BK',
    score: '589/600',
    date: '2024-02-18',
    competition: 'VGBF DM Inomhus',
    competitionUrl: 'https://resultat.bagskytte.se/competitions/2024/vgbf-dm-inomhus',
    organizer: 'VGBF'
  },
  {
    id: '5',
    category: 'Inomhus SBF 18m/12m 15 pilar',
    class: 'Damer Compound',
    name: 'Anna Karlsson',
    club: 'Skövde BK',
    score: '598/600',
    date: '2024-01-28',
    competition: 'Västgöta Inomhus',
    competitionUrl: 'https://resultat.bagskytte.se/competitions/2024/vastgota-inomhus',
    organizer: 'Skövde BK'
  },
  
  // Inomhus SBF 18m/12m 30 pilar
  {
    id: '6',
    category: 'Inomhus SBF 18m/12m 30 pilar',
    class: 'U21 Herrar Recurve',
    name: 'Oskar Lindgren',
    club: 'Göteborg BK',
    score: '575/600',
    date: '2024-03-10',
    competition: 'Ungdoms DM',
    competitionUrl: 'https://resultat.bagskytte.se/competitions/2024/ungdoms-dm',
    organizer: 'VGBF'
  },
  {
    id: '7',
    category: 'Inomhus SBF 18m/12m 30 pilar',
    class: 'U18 Damer Barebow',
    name: 'Emma Svensson',
    club: 'Borås BS',
    score: '512/600',
    date: '2024-02-25',
    competition: 'Regionala Ungdomsmästerskapet',
    organizer: 'Borås BS'
  },

  // Utomhus SBF 900 rond
  {
    id: '8',
    category: 'Utomhus SBF 900 rond',
    class: 'Herrar Barebow',
    name: 'Mikael Gustafsson',
    club: 'Vänersborg BK',
    score: '814',
    date: '2024-08-05',
    competition: 'Dalsland Open',
    competitionUrl: 'https://resultat.bagskytte.se/competitions/2024/dalsland-open',
    organizer: 'Vänersborg BK'
  },
  {
    id: '9',
    category: 'Utomhus SBF 900 rond',
    class: 'Damer Barebow',
    name: 'Karin Blomqvist',
    club: 'Alingsås BK',
    score: '763',
    date: '2024-07-14',
    competition: 'Midsommar Cup',
    organizer: 'Alingsås BK'
  }
]

// Initialize the records file if it doesn't exist
async function initializeRecordsFile() {
  await ensureDataDirectory()
  
  try {
    await fs.access(RECORDS_FILE_PATH)
    console.log('Records file already exists')
  } catch {
    console.log('Creating records file with default data')
    await fs.writeFile(RECORDS_FILE_PATH, JSON.stringify(defaultRecords, null, 2))
  }
}

// Read all records
export async function getDistrictRecords(): Promise<DistrictRecord[]> {
  await initializeRecordsFile()
  
  try {
    const data = await fs.readFile(RECORDS_FILE_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading records:', error)
    return []
  }
}

// Get records by category
export async function getRecordsByCategory(category: string): Promise<DistrictRecord[]> {
  const records = await getDistrictRecords()
  return records.filter(record => record.category === category)
}

// Get record by ID
export async function getRecordById(id: string): Promise<DistrictRecord | null> {
  const records = await getDistrictRecords()
  return records.find(record => record.id === id) || null
}

// Save all records
async function saveRecords(records: DistrictRecord[]): Promise<void> {
  await ensureDataDirectory()
  await fs.writeFile(RECORDS_FILE_PATH, JSON.stringify(records, null, 2))
}

// Add new record
export async function addRecord(record: Omit<DistrictRecord, 'id'>): Promise<DistrictRecord> {
  const records = await getDistrictRecords()
  
  const newRecord: DistrictRecord = {
    ...record,
    id: Date.now().toString()
  }
  
  records.push(newRecord)
  await saveRecords(records)
  
  return newRecord
}

// Update existing record
export async function updateRecord(id: string, updates: Partial<Omit<DistrictRecord, 'id'>>): Promise<DistrictRecord | null> {
  const records = await getDistrictRecords()
  const index = records.findIndex(record => record.id === id)
  
  if (index === -1) {
    return null
  }
  
  records[index] = { ...records[index], ...updates }
  await saveRecords(records)
  
  return records[index]
}

// Delete record
export async function deleteRecord(id: string): Promise<boolean> {
  const records = await getDistrictRecords()
  const initialLength = records.length
  const filteredRecords = records.filter(record => record.id !== id)
  
  if (filteredRecords.length === initialLength) {
    return false
  }
  
  await saveRecords(filteredRecords)
  return true
}

// Get all unique categories
export async function getRecordCategories(): Promise<string[]> {
  const records = await getDistrictRecords()
  const categories = new Set(records.map(record => record.category))
  return Array.from(categories).sort()
}

// Get all unique classes
export async function getRecordClasses(): Promise<string[]> {
  const records = await getDistrictRecords()
  const classes = new Set(records.map(record => record.class))
  return Array.from(classes).sort()
}
