import { sql } from './src/lib/database.js'

async function testSponsorsDB() {
  try {
    console.log('Testing sponsors database...')
    
    // Check if sponsors table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'sponsors'
      );
    `
    console.log('Sponsors table exists:', tableExists[0]?.exists)
    
    if (tableExists[0]?.exists) {
      // Get count of sponsors
      const count = await sql`SELECT COUNT(*) as total FROM sponsors`
      console.log('Total sponsors in database:', count[0]?.total)
      
      // Get all sponsors
      const sponsors = await sql`SELECT * FROM sponsors ORDER BY priority ASC, name ASC`
      console.log('Sponsors in database:', sponsors.length)
      
      sponsors.forEach((sponsor, index) => {
        console.log(`${index + 1}. ${sponsor.name} - Active: ${sponsor.is_active}, Priority: ${sponsor.priority}`)
      })
    }
    
  } catch (error) {
    console.error('Database error:', error)
  }
  
  process.exit(0)
}

testSponsorsDB()