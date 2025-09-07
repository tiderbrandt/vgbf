import pkg from 'pg';
const { Pool } = pkg;
import { randomUUID } from 'crypto';

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateNewsData() {
  try {
    console.log('🔄 Starting news data migration from JSON to PostgreSQL...');
    
    // Read the existing news.json file
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const newsFile = path.join(__dirname, 'data', 'news.json');
    
    if (!fs.existsSync(newsFile)) {
      console.log('❌ No news.json file found at:', newsFile);
      return;
    }
    
    const newsData = JSON.parse(fs.readFileSync(newsFile, 'utf8'));
    console.log(`📰 Found ${newsData.length} news articles in JSON file`);
    
    // First, check if we already have data in the database
    const existingCheck = await pool.query('SELECT COUNT(*) as count FROM news_articles');
    const existingCount = parseInt(existingCheck.rows[0].count);
    
    if (existingCount > 0) {
      console.log(`⚠️  Database already has ${existingCount} news articles`);
      console.log('🔄 Clearing existing data before migration...');
      await pool.query('DELETE FROM news_articles');
    }
    
    // Insert each news article
    let successCount = 0;
    let errorCount = 0;
    
    for (const article of newsData) {
      try {
        // Convert the JSON structure to PostgreSQL structure
        const insertQuery = `
          INSERT INTO news_articles (
            id, title, excerpt, content, published_date, author, slug, 
            is_featured, tags, image_url, image_alt, is_published, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `;
        
        const values = [
          randomUUID(), // Generate new UUID for id
          article.title,
          article.excerpt,
          article.content,
          article.date, // Use 'date' as published_date
          article.author,
          article.slug,
          article.featured || false, // is_featured
          JSON.stringify(article.tags || []), // Store tags as JSON
          article.imageUrl || null,
          article.imageAlt || null,
          true, // is_published - assume all migrated articles are published
          new Date().toISOString(), // created_at
          new Date().toISOString()  // updated_at
        ];
        
        await pool.query(insertQuery, values);
        successCount++;
        
        console.log(`✅ Migrated: "${article.title}" (${article.date})`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to migrate article "${article.title}":`, error.message);
      }
    }
    
    console.log('\n🎉 Migration complete!');
    console.log(`✅ Successfully migrated: ${successCount} articles`);
    if (errorCount > 0) {
      console.log(`❌ Failed to migrate: ${errorCount} articles`);
    }
    
    // Verify the migration
    const finalCheck = await pool.query('SELECT COUNT(*) as count FROM news_articles');
    const finalCount = parseInt(finalCheck.rows[0].count);
    console.log(`📊 Total articles in database: ${finalCount}`);
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrateNewsData();
