import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

try {
  const result = await pool.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'clubs' 
    ORDER BY ordinal_position
  `);
  
  console.log('🏛️ Clubs table schema:');
  result.rows.forEach(row => {
    console.log(`  ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
  });
  
  await pool.end();
} catch (error) {
  console.error('❌ Error:', error.message);
  await pool.end();
}
