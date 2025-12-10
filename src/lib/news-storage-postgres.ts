import { sql } from './database'
import { NewsArticle } from '@/types'

/**
 * PostgreSQL-based news storage implementation using Neon serverless driver
 * Replaces the blob storage for news articles
 */

// Helper function to convert database row to NewsArticle object
function parseJsonArray(value: any) {
  if (value == null) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.trim() === '') return []
  try {
    if (typeof value === 'string') return JSON.parse(value)
  } catch (_) {}
  return []
}

function dbRowToNewsArticle(row: any): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt || '',
    content: row.content || '',
    date: row.published_date || row.date,
    author: row.author || '',
    slug: row.slug,
    featured: row.is_featured === true || row.featured === true,
    imageUrl: row.image_url || '',
    imageAlt: row.image_alt || '',
    tags: Array.isArray(row.tags) ? row.tags : parseJsonArray(row.tags)
  }
}

// Helper function to convert NewsArticle object to database row
function newsArticleToDbRow(article: Partial<NewsArticle>): any {
  return {
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    published_date: article.date,
    author: article.author,
    slug: article.slug,
    is_featured: article.featured === true,
    image_url: article.imageUrl,
    image_alt: article.imageAlt,
    tags: JSON.stringify(article.tags || []),
    is_published: true
  }
}

/**
 * Get all news articles (legacy support, prefers getNewsPreviews for list)
 */
export async function getAllNews(): Promise<NewsArticle[]> {
  try {
    const result = await sql`SELECT * FROM news_articles WHERE is_published = true ORDER BY published_date DESC`
    const rows = Array.isArray(result) ? result : (result.rows || [])
    return rows.map(dbRowToNewsArticle)
  } catch (error) {
    console.error('Error getting all news:', error)
    throw new Error('Failed to fetch news articles')
  }
}

/**
 * Get news previews (lightweight, no content)
 */
export async function getNewsPreviews(): Promise<NewsArticle[]> {
  try {
    // Select all columns EXCEPT 'content' to reduce payload size
    const result = await sql`
      SELECT 
        id, title, excerpt, published_date, author, slug, 
        is_featured, image_url, image_alt, tags 
      FROM news_articles 
      WHERE is_published = true 
      ORDER BY published_date DESC
    `
    const rows = Array.isArray(result) ? result : (result.rows || [])
    
    // Map manually to avoid missing fields issue in dbRowToNewsArticle if we strictly required content
    // But our mapper handles empty content fine, so we can reuse it or make a lightweight one.
    // dbRowToNewsArticle sets content to '' if missing, which is perfect for previews.
    return rows.map(dbRowToNewsArticle)
  } catch (error) {
    console.error('Error getting news previews:', error)
    throw new Error('Failed to fetch news previews')
  }
}

/**
 * Get related news (excluding current, sharing tags is a bonus but for now just recent)
 */
export async function getRelatedNews(currentSlug: string, limit: number = 3): Promise<NewsArticle[]> {
  try {
    const result = await sql`
      SELECT 
       id, title, excerpt, published_date, author, slug, 
        is_featured, image_url, image_alt, tags
      FROM news_articles 
      WHERE is_published = true 
      AND slug != ${currentSlug}
      ORDER BY published_date DESC 
      LIMIT ${limit}
    `
    const rows = Array.isArray(result) ? result : (result.rows || [])
    return rows.map(dbRowToNewsArticle)
  } catch (error) {
    console.error('Error getting related news:', error)
    return [] // Return empty array instead of failing completely
  }
}

/**
 * Get news article by ID
 */
export async function getNewsById(id: string): Promise<NewsArticle | null> {
  try {
    const result = await sql`SELECT * FROM news_articles WHERE id = ${id}`
    // Handle both pg Pool result (result.rows) and Neon direct array result
    const rows = Array.isArray(result) ? result : (result.rows || [])
    return rows.length > 0 ? dbRowToNewsArticle(rows[0]) : null
  } catch (error) {
    console.error('Error getting news by ID:', error)
    throw new Error('Failed to fetch news article')
  }
}

/**
 * Get news article by slug
 */
export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    const result = await sql`SELECT * FROM news_articles WHERE slug = ${slug}`
    // Handle both pg Pool result (result.rows) and Neon direct array result
    const rows = Array.isArray(result) ? result : (result.rows || [])
    return rows.length > 0 ? dbRowToNewsArticle(rows[0]) : null
  } catch (error) {
    console.error('Error getting news by slug:', error)
    throw new Error('Failed to fetch news article')
  }
}

/**
 * Get featured news articles
 */
export async function getFeaturedNews(): Promise<NewsArticle[]> {
  try {
    const result = await sql`SELECT * FROM news_articles WHERE is_featured = true ORDER BY published_date DESC`
    // Handle both pg Pool result (result.rows) and Neon direct array result
    const rows = Array.isArray(result) ? result : (result.rows || [])
    return rows.map(dbRowToNewsArticle)
  } catch (error) {
    console.error('Error getting featured news:', error)
    throw new Error('Failed to fetch featured news')
  }
}

/**
 * Get recent news articles
 */
export async function getRecentNews(limit: number = 4): Promise<NewsArticle[]> {
  try {
    const result = await sql`SELECT * FROM news_articles WHERE is_published = true ORDER BY published_date DESC LIMIT ${limit}`
    // Handle both pg Pool result (result.rows) and Neon direct array result
    const rows = Array.isArray(result) ? result : (result.rows || [])
    return rows.map(dbRowToNewsArticle)
  } catch (error) {
    console.error('Error getting recent news:', error)
    throw new Error('Failed to fetch recent news')
  }
}

/**
 * Add a new news article
 */
export async function addNews(newsData: Omit<NewsArticle, 'id'>): Promise<NewsArticle> {
  try {
    // Generate a proper UUID
    const { v4: uuidv4 } = require('uuid')
    const id = uuidv4()
    const dbData = newsArticleToDbRow({ ...newsData, id })
    
    await sql`
      INSERT INTO news_articles (
        id, title, excerpt, content, published_date, author, slug, is_featured, image_url, image_alt, tags, is_published
      ) VALUES (
        ${id}, ${dbData.title}, ${dbData.excerpt}, ${dbData.content}, ${dbData.published_date},
        ${dbData.author}, ${dbData.slug}, ${dbData.is_featured}, ${dbData.image_url},
        ${dbData.image_alt}, ${dbData.tags}, ${dbData.is_published}
      )
    `
    
    const newArticle = await getNewsById(id)
    if (!newArticle) throw new Error('Failed to retrieve newly created news article')
    return newArticle
  } catch (error) {
    console.error('Error adding news:', error)
    throw new Error('Failed to add news article')
  }
}

/**
 * Update an existing news article
 */
export async function updateNews(id: string, newsData: Partial<NewsArticle>): Promise<NewsArticle | null> {
  try {
    const dbData = newsArticleToDbRow(newsData)
    
    // Use a simple approach: update all fields that are provided
    const result = await sql`
      UPDATE news_articles 
      SET 
        title = COALESCE(${dbData.title}, title),
        excerpt = COALESCE(${dbData.excerpt}, excerpt),
        content = COALESCE(${dbData.content}, content),
        published_date = COALESCE(${dbData.published_date}, published_date),
        author = COALESCE(${dbData.author}, author),
        slug = COALESCE(${dbData.slug}, slug),
        is_featured = COALESCE(${dbData.is_featured}, is_featured),
        image_url = COALESCE(${dbData.image_url}, image_url),
        image_alt = COALESCE(${dbData.image_alt}, image_alt),
        tags = COALESCE(${dbData.tags}, tags),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `
    
    return await getNewsById(id)
  } catch (error) {
    console.error('Error updating news:', error)
    throw new Error('Failed to update news article')
  }
}

/**
 * Delete a news article
 */
export async function deleteNews(id: string): Promise<boolean> {
  try {
    const result = await sql`DELETE FROM news_articles WHERE id = ${id}`
    return true
  } catch (error) {
    console.error('Error deleting news:', error)
    throw new Error('Failed to delete news article')
  }
}

/**
 * Search news articles by title or content
 */
export async function searchNews(query: string): Promise<NewsArticle[]> {
  try {
    const searchTerm = `%${query}%`
    const result = await sql`
      SELECT * FROM news_articles 
      WHERE title ILIKE ${searchTerm} OR content ILIKE ${searchTerm}
      ORDER BY date DESC
    `
    // Handle both pg Pool result (result.rows) and Neon direct array result
    const rows = Array.isArray(result) ? result : (result.rows || [])
    return rows.map(dbRowToNewsArticle)
  } catch (error) {
    console.error('Error searching news:', error)
    throw new Error('Failed to search news articles')
  }
}
