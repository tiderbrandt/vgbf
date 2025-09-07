import { sql } from '../src/lib/database'
import { getAllNews } from '../src/lib/news-storage-unified'
import { getAllCompetitions } from '../src/lib/competitions-storage-unified'
import { getAllRecords } from '../src/lib/records-storage-unified'
import { getAllSponsors } from '../src/lib/sponsors-storage-unified'
import { getAllClubs } from '../src/lib/clubs-storage-unified'

/**
 * Comprehensive migration script to move all data from blob storage to PostgreSQL
 * This script should be run once to migrate all existing data
 */

interface MigrationResult {
  success: boolean
  migrated: number
  errors: string[]
}

/**
 * Migrate news articles from blob to PostgreSQL
 */
async function migrateNews(): Promise<MigrationResult> {
  const result: MigrationResult = { success: true, migrated: 0, errors: [] }
  
  try {
    console.log('Starting news migration...')
    
    // Get news from unified storage (blob or local)
    const newsFromBlob = await getAllNews()
    console.log(`Found ${newsFromBlob.length} news articles in blob storage`)
    
    for (const news of newsFromBlob) {
      try {
        // Check if news already exists in PostgreSQL
        const existing = await sql`SELECT id FROM news WHERE id = ${news.id}`
        
        if (existing.length === 0) {
          await sql`
            INSERT INTO news (
              id, title, slug, excerpt, content, author, published_date, 
              category, tags, image_url, is_published, is_featured
            ) VALUES (
              ${news.id}, ${news.title}, ${news.slug}, ${news.excerpt}, 
              ${news.content}, ${news.author}, ${news.date}, 
              ${'general'}, ${JSON.stringify(news.tags || [])}, 
              ${news.imageUrl}, ${true}, ${news.featured === true}
            )
          `
          result.migrated++
          console.log(`Migrated news: ${news.title}`)
        } else {
          console.log(`News already exists: ${news.title}`)
        }
      } catch (error) {
        const errorMsg = `Failed to migrate news "${news.title}": ${error}`
        result.errors.push(errorMsg)
        console.error(errorMsg)
      }
    }
  } catch (error) {
    result.success = false
    result.errors.push(`News migration failed: ${error}`)
    console.error('News migration failed:', error)
  }
  
  return result
}

/**
 * Migrate competitions from blob to PostgreSQL
 */
async function migrateCompetitions(): Promise<MigrationResult> {
  const result: MigrationResult = { success: true, migrated: 0, errors: [] }
  
  try {
    console.log('Starting competitions migration...')
    
    const competitionsFromBlob = await getAllCompetitions()
    console.log(`Found ${competitionsFromBlob.length} competitions in blob storage`)
    
    for (const comp of competitionsFromBlob) {
      try {
        const existing = await sql`SELECT id FROM competitions WHERE id = ${comp.id}`
        
        if (existing.length === 0) {
          await sql`
            INSERT INTO competitions (
              id, name, description, date, end_date, location, organizer, 
              contact_email, registration_url, entry_fee, disciplines, 
              categories, max_participants, current_participants, status, is_public
            ) VALUES (
              ${comp.id}, ${comp.title}, ${comp.description}, ${comp.date}, 
              ${comp.endDate}, ${comp.location}, ${comp.organizer}, 
              ${comp.contactEmail}, ${comp.registrationUrl}, ${comp.fee}, 
              ${JSON.stringify(comp.equipment || [])}, ${JSON.stringify([comp.category])},
              ${comp.maxParticipants}, ${comp.currentParticipants || 0}, 
              ${comp.status || 'upcoming'}, ${true}
            )
          `
          result.migrated++
          console.log(`Migrated competition: ${comp.title}`)
        } else {
          console.log(`Competition already exists: ${comp.title}`)
        }
      } catch (error) {
        const errorMsg = `Failed to migrate competition "${comp.title}": ${error}`
        result.errors.push(errorMsg)
        console.error(errorMsg)
      }
    }
  } catch (error) {
    result.success = false
    result.errors.push(`Competitions migration failed: ${error}`)
    console.error('Competitions migration failed:', error)
  }
  
  return result
}

/**
 * Migrate records from blob to PostgreSQL
 */
async function migrateRecords(): Promise<MigrationResult> {
  const result: MigrationResult = { success: true, migrated: 0, errors: [] }
  
  try {
    console.log('Starting records migration...')
    
    const recordsFromBlob = await getAllRecords()
    console.log(`Found ${recordsFromBlob.length} records in blob storage`)
    
    for (const record of recordsFromBlob) {
      try {
        const existing = await sql`SELECT id FROM records WHERE id = ${record.id}`
        
        if (existing.length === 0) {
          await sql`
            INSERT INTO records (
              id, archer_name, club, category, discipline, distance, 
              score, max_score, year, location, verified
            ) VALUES (
              ${record.id}, ${record.name}, ${record.club}, 
              ${record.category}, ${record.class}, ${''}, 
              ${record.score}, ${''}, ${new Date(record.date).getFullYear()}, 
              ${record.competition}, ${true}
            )
          `
          result.migrated++
          console.log(`Migrated record: ${record.name} - ${record.class}`)
        } else {
          console.log(`Record already exists: ${record.name} - ${record.class}`)
        }
      } catch (error) {
        const errorMsg = `Failed to migrate record "${record.name} - ${record.class}": ${error}`
        result.errors.push(errorMsg)
        console.error(errorMsg)
      }
    }
  } catch (error) {
    result.success = false
    result.errors.push(`Records migration failed: ${error}`)
    console.error('Records migration failed:', error)
  }
  
  return result
}

/**
 * Migrate sponsors from blob to PostgreSQL
 */
async function migrateSponsors(): Promise<MigrationResult> {
  const result: MigrationResult = { success: true, migrated: 0, errors: [] }
  
  try {
    console.log('Starting sponsors migration...')
    
    const sponsorsFromBlob = await getAllSponsors()
    console.log(`Found ${sponsorsFromBlob.length} sponsors in blob storage`)
    
    for (const sponsor of sponsorsFromBlob) {
      try {
        const existing = await sql`SELECT id FROM sponsors WHERE id = ${sponsor.id}`
        
        if (existing.length === 0) {
          await sql`
            INSERT INTO sponsors (
              id, name, description, website_url, logo_url, 
              contact_email, phone, priority, is_active
            ) VALUES (
              ${sponsor.id}, ${sponsor.name}, ${sponsor.description}, 
              ${sponsor.website}, ${sponsor.logoUrl}, ${''}, 
              ${''}, ${sponsor.priority || 1}, ${sponsor.isActive !== false}
            )
          `
          result.migrated++
          console.log(`Migrated sponsor: ${sponsor.name}`)
        } else {
          console.log(`Sponsor already exists: ${sponsor.name}`)
        }
      } catch (error) {
        const errorMsg = `Failed to migrate sponsor "${sponsor.name}": ${error}`
        result.errors.push(errorMsg)
        console.error(errorMsg)
      }
    }
  } catch (error) {
    result.success = false
    result.errors.push(`Sponsors migration failed: ${error}`)
    console.error('Sponsors migration failed:', error)
  }
  
  return result
}

/**
 * Migrate clubs from blob to PostgreSQL
 */
async function migrateClubs(): Promise<MigrationResult> {
  const result: MigrationResult = { success: true, migrated: 0, errors: [] }
  
  try {
    console.log('Starting clubs migration...')
    
    const clubsFromBlob = await getAllClubs()
    console.log(`Found ${clubsFromBlob.length} clubs in blob storage`)
    
    for (const club of clubsFromBlob) {
      try {
        const existing = await sql`SELECT id FROM clubs WHERE id = ${club.id}`
        
        if (existing.length === 0) {
          await sql`
            INSERT INTO clubs (
              id, name, description, address, postal_code, city, 
              phone, email, website, contact_person, latitude, 
              longitude, facilities, disciplines, is_active
            ) VALUES (
              ${club.id}, ${club.name}, ${club.description}, ${club.address}, 
              ${club.postalCode}, ${club.city}, ${club.phone}, ${club.email}, 
              ${club.website}, ${club.contactPerson}, ${0}, 
              ${0}, ${JSON.stringify(club.facilities || [])}, 
              ${JSON.stringify(club.activities || [])}, ${true}
            )
          `
          result.migrated++
          console.log(`Migrated club: ${club.name}`)
        } else {
          console.log(`Club already exists: ${club.name}`)
        }
      } catch (error) {
        const errorMsg = `Failed to migrate club "${club.name}": ${error}`
        result.errors.push(errorMsg)
        console.error(errorMsg)
      }
    }
  } catch (error) {
    result.success = false
    result.errors.push(`Clubs migration failed: ${error}`)
    console.error('Clubs migration failed:', error)
  }
  
  return result
}

/**
 * Run the complete migration
 */
export async function runFullMigration(): Promise<void> {
  console.log('Starting comprehensive data migration from blob storage to PostgreSQL...')
  console.log('='.repeat(70))
  
  const startTime = Date.now()
  const results: { [key: string]: MigrationResult } = {}
  
  // Run all migrations
  results.news = await migrateNews()
  results.competitions = await migrateCompetitions()
  results.records = await migrateRecords()
  results.sponsors = await migrateSponsors()
  results.clubs = await migrateClubs()
  
  // Summary
  console.log('\n' + '='.repeat(70))
  console.log('MIGRATION SUMMARY')
  console.log('='.repeat(70))
  
  let totalMigrated = 0
  let totalErrors = 0
  let allSuccessful = true
  
  for (const [type, result] of Object.entries(results)) {
    console.log(`\n${type.toUpperCase()}:`)
    console.log(`  Migrated: ${result.migrated}`)
    console.log(`  Errors: ${result.errors.length}`)
    console.log(`  Success: ${result.success ? 'YES' : 'NO'}`)
    
    if (result.errors.length > 0) {
      console.log('  Error details:')
      result.errors.forEach(error => console.log(`    - ${error}`))
    }
    
    totalMigrated += result.migrated
    totalErrors += result.errors.length
    if (!result.success) allSuccessful = false
  }
  
  const duration = (Date.now() - startTime) / 1000
  
  console.log('\n' + '='.repeat(70))
  console.log('OVERALL SUMMARY')
  console.log('='.repeat(70))
  console.log(`Total items migrated: ${totalMigrated}`)
  console.log(`Total errors: ${totalErrors}`)
  console.log(`Overall success: ${allSuccessful ? 'YES' : 'NO'}`)
  console.log(`Migration duration: ${duration.toFixed(2)} seconds`)
  console.log('='.repeat(70))
  
  if (allSuccessful && totalErrors === 0) {
    console.log('✅ Migration completed successfully!')
    console.log('You can now safely switch to PostgreSQL storage implementations.')
  } else {
    console.log('⚠️  Migration completed with errors. Please review the error details above.')
  }
}

// Execute migration if running directly
if (require.main === module) {
  runFullMigration().catch(console.error)
}
