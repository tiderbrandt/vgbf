import { readFileSync, writeFileSync } from 'fs'

const filePath = './src/lib/news-storage-postgres.ts'
let content = readFileSync(filePath, 'utf8')

// Update all table references from "news" to "news_articles"
content = content.replace(/FROM news ORDER BY date DESC/g, 'FROM news_articles WHERE is_published = true ORDER BY published_date DESC')
content = content.replace(/FROM news WHERE id = /g, 'FROM news_articles WHERE id = ')
content = content.replace(/FROM news WHERE slug = /g, 'FROM news_articles WHERE slug = ')
content = content.replace(/FROM news WHERE featured = true ORDER BY date DESC/g, 'FROM news_articles WHERE is_featured = true ORDER BY published_date DESC')
content = content.replace(/FROM news ORDER BY date DESC LIMIT/g, 'FROM news_articles WHERE is_published = true ORDER BY published_date DESC LIMIT')
content = content.replace(/DELETE FROM news WHERE id = /g, 'DELETE FROM news_articles WHERE id = ')
content = content.replace(/SELECT \* FROM news/g, 'SELECT * FROM news_articles')

// Update INSERT statements to use new table and column names
content = content.replace(/INSERT INTO news/g, 'INSERT INTO news_articles')

writeFileSync(filePath, content)
console.log('✅ Updated news storage to use news_articles table')
