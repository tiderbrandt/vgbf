import { DistrictRecord } from '@/types'
import { BlobStorage } from './blob-storage'

// Initialize blob storage for records
const recordsStorage = new BlobStorage<DistrictRecord>('data/records.json')

// Default records data
const defaultRecords: DistrictRecord[] = [
  {
    id: '1',
    category: 'Utomhus 70m',
    class: 'Herrar Recurve',
    name: 'Erik Andersson',
    club: 'Göteborgs BSK',
    score: '675',
    date: '2023-07-15',
    competition: 'SM Utomhus',
    organizer: 'Svenska Bågskytteförbundet',
    notes: 'Nytt svenskt rekord'
  },
  {
    id: '2',
    category: 'Inomhus 18m',
    class: 'Damer Compound',
    name: 'Anna Svensson',
    club: 'Borås BS',
    score: '598/600',
    date: '2023-12-10',
    competition: 'DM Inomhus',
    organizer: 'Västra Götalands Bågskytteförbund'
  }
]

export async function getDistrictRecords(): Promise<DistrictRecord[]> {
  try {
    const records = await recordsStorage.read()
    return records.length > 0 ? records : defaultRecords
  } catch (error) {
    console.error('Error reading records from blob storage:', error)
    return defaultRecords
  }
}

export async function getRecordsByCategory(category: string): Promise<DistrictRecord[]> {
  const records = await getDistrictRecords()
  return records.filter(record => record.category.toLowerCase().includes(category.toLowerCase()))
}

export async function getRecordsByClass(recordClass: string): Promise<DistrictRecord[]> {
  const records = await getDistrictRecords()
  return records.filter(record => record.class.toLowerCase().includes(recordClass.toLowerCase()))
}

export async function getRecordsByClub(club: string): Promise<DistrictRecord[]> {
  const records = await getDistrictRecords()
  return records.filter(record => record.club.toLowerCase().includes(club.toLowerCase()))
}

export async function addRecord(record: Omit<DistrictRecord, 'id'>): Promise<DistrictRecord> {
  const records = await getDistrictRecords()
  const newRecord: DistrictRecord = {
    ...record,
    id: Date.now().toString()
  }
  
  records.push(newRecord)
  await recordsStorage.write(records)
  return newRecord
}

export async function updateRecord(id: string, updates: Partial<DistrictRecord>): Promise<DistrictRecord | null> {
  const records = await getDistrictRecords()
  const index = records.findIndex(record => record.id === id)
  
  if (index === -1) {
    return null
  }
  
  records[index] = { ...records[index], ...updates }
  await recordsStorage.write(records)
  return records[index]
}

export async function deleteRecord(id: string): Promise<boolean> {
  const records = await getDistrictRecords()
  const index = records.findIndex(record => record.id === id)
  
  if (index === -1) {
    return false
  }
  
  records.splice(index, 1)
  await recordsStorage.write(records)
  return true
}

export async function getRecentRecords(limit: number = 10): Promise<DistrictRecord[]> {
  const records = await getDistrictRecords()
  return records
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}
