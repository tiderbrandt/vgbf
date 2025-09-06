import { neon } from '@neondatabase/serverless';

// Create a connection function using Neon serverless driver
const connectionString = process.env.DATABASE_URL!;

export const sql = neon(connectionString);

// Simple query helper for direct SQL execution using the serverless driver's conventional API
export async function query(text: string, params?: any[]) {
  try {
    let result;
    if (params && params.length > 0) {
      // Use the driver's query method for parameterized queries
      result = await (sql as any).query(text, params);
    } else {
      // Use tagged-template form for raw SQL to satisfy the serverless API
      // This invokes the function as a tagged template: sql`...`
      result = await (sql as any)([text] as any as TemplateStringsArray)
    }

    // The driver may return rows directly or a result object
    const rows = result.rows ?? result
    const rowCount = result.rowCount ?? (Array.isArray(rows) ? rows.length : undefined)
    return { rows, rowCount };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// For backwards compatibility, export sql as default
export default sql;
