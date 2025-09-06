import { Pool } from 'pg'

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error if connection takes longer than 2 seconds
})

// Handle pool errors
pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err)
})

export default pool

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  const client = await pool.connect()
  
  try {
    const result = await client.query(text, params)
    const duration = Date.now() - start
    console.log('Query executed:', { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error('Database query error:', { text, params, error })
    throw error
  } finally {
    client.release()
  }
}

// Helper function to execute transactions
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
