import pkg from 'pg';
const { Pool } = pkg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

try {
  console.log('🔍 Checking club tables in PostgreSQL database...');
  
  const result = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE '%club%'
    ORDER BY table_name
  `);
  
  console.log('🏛️ Club tables found:');
  result.rows.forEach(row => console.log('  ✅', row.table_name));
  
  if (result.rows.length === 0) {
    console.log('  ❌ No club tables found - need to create tables');
  }
  
  // Also check if there's any club data
  if (result.rows.length > 0) {
    try {
      const countResult = await pool.query('SELECT COUNT(*) as count FROM clubs');
      console.log(`📊 Club records: ${countResult.rows[0].count}`);
    } catch (error) {
      console.log('⚠️ Club table exists but might be empty or have issues');
    }
  }
  
  await pool.end();
  
} catch (error) {
  console.error('❌ Database error:', error.message);
  await pool.end();
  process.exit(1);
}
