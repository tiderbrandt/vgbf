import { sql } from './src/lib/database.js'

const missingRecords = [
  {
    "id": "6",
    "category": "Inomhus SBF 18m/12m 30 pilar",
    "class": "U21 Herrar Recurve",
    "name": "Oskar Lindgren",
    "club": "Göteborg BK",
    "score": "575/600",
    "date": "2024-03-10",
    "competition": "Ungdoms DM",
    "competitionUrl": "https://resultat.bagskytte.se/competitions/2024/ungdoms-dm",
    "organizer": "VGBF"
  },
  {
    "id": "7",
    "category": "Inomhus SBF 18m/12m 30 pilar",
    "class": "U18 Damer Barebow",
    "name": "Emma Svensson",
    "club": "Borås BS",
    "score": "512/600",
    "date": "2024-02-25",
    "competition": "Regionala Ungdomsmästerskapet",
    "organizer": "Borås BS"
  },
  {
    "id": "8",
    "category": "Utomhus SBF 900 rond",
    "class": "Herrar Barebow",
    "name": "Mikael Gustafsson",
    "club": "Vänersborg BK",
    "score": "814",
    "date": "2024-08-05",
    "competition": "Dalsland Open",
    "competitionUrl": "https://resultat.bagskytte.se/competitions/2024/dalsland-open",
    "organizer": "Vänersborg BK"
  },
  {
    "id": "9",
    "category": "Utomhus SBF 900 rond",
    "class": "Damer Barebow",
    "name": "Karin Blomqvist",
    "club": "Alingsås BK",
    "score": "763",
    "date": "2024-07-14",
    "competition": "Midsommar Cup",
    "organizer": "Alingsås BK"
  }
]

async function addMissingRecords() {
  console.log('🔍 Adding missing district records...')
  
  try {
    // Check which records already exist
    for (const record of missingRecords) {
      console.log(`Checking record: ${record.name} - ${record.class}`)
      
      // Check if record already exists by name, class, and competition
      const existing = await sql`
        SELECT id FROM district_records 
        WHERE name = ${record.name} 
        AND class = ${record.class} 
        AND competition = ${record.competition}
      `
      
      const existingRows = Array.isArray(existing) ? existing : (existing.rows || [])
      
      if (existingRows.length > 0) {
        console.log(`  ⚠️ Record already exists, skipping...`)
        continue
      }
      
      // Insert the record
      await sql`
        INSERT INTO district_records (
          id, category, class, name, club, score, date, competition, competition_url, organizer
        ) VALUES (
          ${record.id}, 
          ${record.category}, 
          ${record.class}, 
          ${record.name}, 
          ${record.club}, 
          ${record.score}, 
          ${record.date}, 
          ${record.competition}, 
          ${record.competitionUrl || null}, 
          ${record.organizer}
        )
      `
      
      console.log(`  ✅ Added: ${record.name} - ${record.class} (${record.category})`)
    }
    
    // Get final count
    const finalCount = await sql`SELECT COUNT(*) as count FROM district_records`
    const count = Array.isArray(finalCount) ? finalCount[0]?.count : finalCount.rows?.[0]?.count
    
    console.log(`\n🎉 Migration complete! Total records in database: ${count}`)
    
    // Show categories
    const categories = await sql`SELECT DISTINCT category FROM district_records ORDER BY category`
    const cats = Array.isArray(categories) ? categories : (categories.rows || [])
    
    console.log('\n📋 Categories in database:')
    cats.forEach(cat => {
      console.log(`  - ${cat.category}`)
    })
    
  } catch (error) {
    console.error('❌ Error adding missing records:', error)
    throw error
  }
}

// Run migration
addMissingRecords()
  .then(() => {
    console.log('✅ Migration completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
