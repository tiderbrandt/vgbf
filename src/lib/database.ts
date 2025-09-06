import { neon } from '@neondatabase/serverless';

// Create a connection function using Neon serverless driver
export const sql = neon(process.env.DATABASE_URL!);

// Simple query helper for direct SQL execution
export async function query(text: string, params?: any[]) {
  try {
    // For Neon serverless, we need to use template literals or direct calls
    let result;
    if (params && params.length > 0) {
      // Use parameterized query format
      result = await sql(text as any, params);
    } else {
      // Use template literal format
      result = await sql`${text}`;
    }
    return { rows: result, rowCount: result.length };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// For backwards compatibility, export sql as default
export default sql;
