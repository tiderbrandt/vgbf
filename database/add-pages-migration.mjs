#!/usr/bin/env node
/**
 * Migration script to add pages table to the database
 * Run with: node database/add-pages-migration.mjs
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import database helper
const { sql } = await import('../src/lib/database.ts');

async function runMigration() {
  try {
    console.log('Starting pages table migration...');
    
    // Read the SQL file
    const sqlContent = await readFile(join(__dirname, 'add-pages-table.sql'), 'utf-8');
    
    // Split by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await sql.query(statement);
        console.log('✓ Executed statement');
      }
    }
    
    console.log('✅ Pages table migration completed successfully!');
    
    // Test the table by selecting data
    const result = await sql`SELECT COUNT(*) as count FROM pages`;
    console.log(`📊 Pages table contains ${result[0].count} records`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();