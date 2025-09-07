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
    date: row.date,
    author: row.author || '',
    slug: row.slug,
    featured: row.featured === true,
    imageUrl: row.image_url || '',
    imageAlt: row.image_alt || '',
    tags: parseJsonArray(row.tags)
  }
}

// Helper function to convert NewsArticle object to database row
function newsArticleToDbRow(article: Partial<NewsArticle>): any {
  return {
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    date: article.date,
    author: article.author,
    slug: article.slug,
    featured: article.featured === true,
    image_url: article.imageUrl,
    image_alt: article.imageAlt,
    tags: JSON.stringify(article.tags || [])
  }
}

/**
 * Get all news articles
 */
export async function getAllNews(): Promise<NewsArticle[]> {
  try {
    const rows = await sql`SELECT * FROM news ORDER BY date DESC`
    return rows.map(dbRowToNewsArticle)
  } catch (error) {
    console.error('Error getting all news:', error)
    throw new Error('Failed to fetch news articles')
  }
}

/**
 * Get news article by ID
 */
export async function getNewsById(id: string): Promise<NewsArticle | null> {
  try {
    const rows = await sql`SELECT * FROM news WHERE id = ${id}`
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
    const rows = await sql`SELECT * FROM news WHERE slug = ${slug}`
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
    const rows = await sql`SELECT * FROM news WHERE featured = true ORDER BY date DESC`
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
    const rows = await sql`SELECT * FROM news ORDER BY date DESC LIMIT ${limit}`
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
    const id = Date.now().toString()
    const dbData = newsArticleToDbRow({ ...newsData, id })
    
    await sql`
      INSERT INTO news (
        id, title, excerpt, content, date, author, slug, featured, image_url, image_alt, tags
      ) VALUES (
        ${id}, ${dbData.title}, ${dbData.excerpt}, ${dbData.content}, ${dbData.date},
        ${dbData.author}, ${dbData.slug}, ${dbData.featured}, ${dbData.image_url},
        ${dbData.image_alt}, ${dbData.tags}
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
    
    // Build dynamic update query
    const updateFields = []
    const values = []
    
    if (dbData.title !== undefined) {
      updateFields.push('title = $' + (values.length + 1))
      values.push(dbData.title)
    }
    if (dbData.excerpt !== undefined) {
      updateFields.push('excerpt = $' + (values.length + 1))
      values.push(dbData.excerpt)
    }
    if (dbData.content !== undefined) {
      updateFields.push('content = $' + (values.length + 1))
      values.push(dbData.content)
    }
    if (dbData.date !== undefined) {
      updateFields.push('date = $' + (values.length + 1))
      values.push(dbData.date)
    }
    if (dbData.author !== undefined) {
      updateFields.push('author = $' + (values.length + 1))
      values.push(dbData.author)
    }
    if (dbData.slug !== undefined) {
      updateFields.push('slug = $' + (values.length + 1))
      values.push(dbData.slug)
    }
    if (dbData.featured !== undefined) {
      updateFields.push('featured = $' + (values.length + 1))
      values.push(dbData.featured)
    }
    if (dbData.image_url !== undefined) {
      updateFields.push('image_url = $' + (values.length + 1))
      values.push(dbData.image_url)
    }
    if (dbData.image_alt !== undefined) {
      updateFields.push('image_alt = $' + (values.length + 1))
      values.push(dbData.image_alt)
    }
    if (dbData.tags !== undefined) {
      updateFields.push('tags = $' + (values.length + 1))
      values.push(dbData.tags)
    }
    
    if (updateFields.length === 0) {
      return await getNewsById(id)
    }
    
    // Add id as the last parameter
    values.push(id)
    const whereClause = 'id = $' + values.length
    
    const updateQuery = `UPDATE news SET ${updateFields.join(', ')} WHERE ${whereClause}`
    
    await sql.query(updateQuery, values)
    
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
    const result = await sql`DELETE FROM news WHERE id = ${id}`
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
    const rows = await sql`
      SELECT * FROM news 
      WHERE title ILIKE ${searchTerm} OR content ILIKE ${searchTerm}
      ORDER BY date DESC
    `
    return rows.map(dbRowToNewsArticle)
  } catch (error) {
    console.error('Error searching news:', error)
    throw new Error('Failed to search news articles')
  }
}
