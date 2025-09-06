import { neon } from '@neondatabase/serverless';

// Create a connection function using Neon serverless driver
const connectionString = process.env.DATABASE_URL!;

export const sql = neon(connectionString);

// Simple query helper for direct SQL execution
export async function query(text: string, params?: any[]) {
  try {
    // For Neon serverless, we need to use template literals
    let result;
    if (params && params.length > 0) {
      // Use parameterized query - but this needs proper handling
      // For now, use template literals with manual substitution
      result = await sql([text] as any as TemplateStringsArray, ...params);
    } else {
      // Use template literal format
      result = await sql([text] as any as TemplateStringsArray);
    }
    return { rows: result, rowCount: result.length };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// For backwards compatibility, export sql as default
export default sql;
