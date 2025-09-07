import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function checkNewsData() {
  try {
    console.log('🔍 Checking production Neon database for news...');
    
    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'news_articles'
      );
    `;
    
    if (!tableCheck[0].exists) {
      console.log('❌ news_articles table does not exist in production database');
      return;
    }
    
    console.log('✅ news_articles table exists');
    
    const result = await sql`SELECT COUNT(*) as total FROM news_articles`;
    console.log('📊 Total news articles in production:', result[0].total);
    
    if (result[0].total > 0) {
      const samples = await sql`SELECT title, slug, published_date, is_featured FROM news_articles ORDER BY published_date DESC LIMIT 3`;
      console.log('📰 Sample articles:');
      samples.forEach((article, i) => {
        console.log(`  ${i+1}. '${article.title}' (slug: ${article.slug})`);
        console.log(`     Published: ${article.published_date}, Featured: ${article.is_featured}`);
      });
    } else {
      console.log('📝 No news articles found in production database');
      console.log('');
      console.log('💡 This explains why your production site shows news but local doesn\'t:');
      console.log('   - Production site might be using blob storage fallback');
      console.log('   - Or the news data is in a different table/database');
    }
  } catch (error) {
    console.log('❌ Error connecting to production database:', error.message);
  }
}

checkNewsData();
