import { NextRequest, NextResponse } from 'next/server'
import { BlobStorage } from '@/lib/blob-storage'
import { Competition, DistrictRecord, CalendarEvent, Sponsor } from '@/types'

// Initialize blob storage for all data types
const competitionsStorage = new BlobStorage<Competition>('data/competitions.json')
const recordsStorage = new BlobStorage<DistrictRecord>('data/records.json')
const calendarStorage = new BlobStorage<CalendarEvent>('data/calendar.json')
const sponsorsStorage = new BlobStorage<Sponsor>('data/sponsors.json')

// Read data from local files
async function readLocalData<T>(fileName: string): Promise<T[]> {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    const filePath = path.join(process.cwd(), 'data', fileName)
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Could not read ${fileName}:`, error)
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting migration of all data to blob storage...')
    
    const results = {
      competitions: { local: 0, blob: 0, migrated: 0 },
      records: { local: 0, blob: 0, migrated: 0 },
      calendar: { local: 0, blob: 0, migrated: 0 },
      sponsors: { local: 0, blob: 0, migrated: 0 }
    }
    
    // Migrate Competitions
    console.log('Migrating competitions...')
    const localCompetitions = await readLocalData<Competition>('competitions.json')
    results.competitions.local = localCompetitions.length
    
    if (localCompetitions.length > 0) {
      await competitionsStorage.write(localCompetitions)
      const verifyCompetitions = await competitionsStorage.read()
      results.competitions.blob = verifyCompetitions.length
      results.competitions.migrated = verifyCompetitions.length
    }
    
    // Migrate Records
    console.log('Migrating records...')
    const localRecords = await readLocalData<DistrictRecord>('records.json')
    results.records.local = localRecords.length
    
    if (localRecords.length > 0) {
      await recordsStorage.write(localRecords)
      const verifyRecords = await recordsStorage.read()
      results.records.blob = verifyRecords.length
      results.records.migrated = verifyRecords.length
    }
    
    // Migrate Calendar
    console.log('Migrating calendar...')
    const localCalendar = await readLocalData<CalendarEvent>('calendar.json')
    results.calendar.local = localCalendar.length
    
    if (localCalendar.length > 0) {
      await calendarStorage.write(localCalendar)
      const verifyCalendar = await calendarStorage.read()
      results.calendar.blob = verifyCalendar.length
      results.calendar.migrated = verifyCalendar.length
    }
    
    // Migrate Sponsors
    console.log('Migrating sponsors...')
    const localSponsors = await readLocalData<Sponsor>('sponsors.json')
    results.sponsors.local = localSponsors.length
    
    if (localSponsors.length > 0) {
      await sponsorsStorage.write(localSponsors)
      const verifySponsors = await sponsorsStorage.read()
      results.sponsors.blob = verifySponsors.length
      results.sponsors.migrated = verifySponsors.length
    }
    
    const totalMigrated = results.competitions.migrated + results.records.migrated + 
                         results.calendar.migrated + results.sponsors.migrated
    
    return NextResponse.json({
      success: true,
      message: `Successfully migrated all data to blob storage`,
      totalMigrated,
      details: results
    })
    
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to migrate data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
