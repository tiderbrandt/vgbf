import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/database'
import { getAllClubs as getBlobClubs } from '@/lib/clubs-storage-unified'

export async function POST() {
  try {
    console.log('🚀 Starting data migration from blob storage to PostgreSQL...')
    
    // Get all clubs from blob storage
    console.log('📥 Fetching clubs from blob storage...')
    const blobClubs = await getBlobClubs()
    console.log(`Found ${blobClubs.length} clubs in blob storage`)
    
    if (blobClubs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No clubs found in blob storage to migrate',
        migratedCount: 0
      })
    }
    
    // Check if clubs already exist in PostgreSQL
    const existingResult = await sql`SELECT COUNT(*) as count FROM clubs`
    const existingCount = parseInt(existingResult[0].count)
    
    if (existingCount > 0) {
      console.log(`⚠️ Found ${existingCount} existing clubs in PostgreSQL`)
      return NextResponse.json({
        success: false,
        message: `Database already contains ${existingCount} clubs. Clear the clubs table first if you want to re-migrate.`,
        existingCount
      })
    }
    
    // Migrate each club to PostgreSQL
    console.log('🔄 Migrating clubs to PostgreSQL...')
    let migratedCount = 0
    
    for (const club of blobClubs) {
      try {
        // Insert club into PostgreSQL using Neon serverless driver
        await sql`
          INSERT INTO clubs (
            id, name, description, location, contact_person, email, phone, website,
            address, postal_code, city, established, activities, facilities,
            training_times, member_count, membership_fee, welcomes_new_members,
            facebook, instagram, image_url
          ) VALUES (
            ${club.id}, ${club.name}, ${club.description}, ${club.location}, ${club.contactPerson},
            ${club.email}, ${club.phone}, ${club.website}, ${club.address}, ${club.postalCode},
            ${club.city}, ${club.established}, ${JSON.stringify(club.activities)}, ${JSON.stringify(club.facilities)},
            ${JSON.stringify(club.trainingTimes)}, ${club.memberCount}, ${club.membershipFee},
            ${club.welcomesNewMembers}, ${club.facebook}, ${club.instagram}, ${club.imageUrl}
          )
        `
        
        migratedCount++
        console.log(`✅ Migrated club: ${club.name}`)
      } catch (clubError) {
        console.error(`❌ Failed to migrate club ${club.name}:`, clubError)
      }
    }
    
    console.log(`🎉 Migration completed! Migrated ${migratedCount}/${blobClubs.length} clubs`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${migratedCount} clubs from blob storage to PostgreSQL`,
      totalClubs: blobClubs.length,
      migratedCount
    })
    
  } catch (error) {
    console.error('❌ Data migration failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
