import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkContactTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%contact%'
      ORDER BY table_name
    `);
    console.log('📋 Contact-related tables in PostgreSQL:');
    if (result.rows.length > 0) {
      result.rows.forEach(row => console.log(`  - ${row.table_name}`));
    } else {
      console.log('  ❌ No contact tables found');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkContactTables();
