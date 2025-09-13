import { sql } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author?: string;
  status: 'draft' | 'published' | 'private';
  featured_image?: string;
  featured_image_alt?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  template?: string;
  show_in_navigation: boolean;
  navigation_order: number;
  parent_page_id?: string;
  view_count: number;
  featured: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

// GET /api/pages - List all pages with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const navigation = searchParams.get('navigation');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    let query = sql`
      SELECT *
      FROM pages
      WHERE 1=1
    `;
    
    // Apply filters
    const conditions = [];
    const params = [];
    
    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (featured === 'true') {
      conditions.push(`featured = true`);
    }
    
    if (navigation === 'true') {
      conditions.push(`show_in_navigation = true`);
    }
    
    // Build the complete query
    let queryStr = `
      SELECT *
      FROM pages
      WHERE 1=1
    `;
    
    if (conditions.length > 0) {
      queryStr += ` AND ` + conditions.join(' AND ');
    }
    
    queryStr += ` ORDER BY navigation_order ASC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const pages = await sql.query(queryStr, params);
    
    // Get total count for pagination
    let countQueryStr = `SELECT COUNT(*) as total FROM pages WHERE 1=1`;
    const countParams = [];
    
    if (status) {
      countQueryStr += ` AND status = $${countParams.length + 1}`;
      countParams.push(status);
    }
    
    if (featured === 'true') {
      countQueryStr += ` AND featured = true`;
    }
    
    if (navigation === 'true') {
      countQueryStr += ` AND show_in_navigation = true`;
    }
    
    const countResult = await sql.query(countQueryStr, countParams);
    const total = parseInt(countResult[0].total);
    
    return NextResponse.json({
      pages: pages || [],
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
    
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

// POST /api/pages - Create a new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      author,
      status = 'draft',
      featured_image,
      featured_image_alt,
      meta_title,
      meta_description,
      meta_keywords,
      template = 'default',
      show_in_navigation = false,
      navigation_order = 0,
      parent_page_id,
      featured = false
    } = body;
    
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      );
    }
    
    // Check if slug already exists
    const existingPage = await sql`
      SELECT id FROM pages WHERE slug = ${slug}
    `;
    
    if (existingPage.length > 0) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 409 }
      );
    }
    
    const id = uuidv4();
    const published_at = status === 'published' ? new Date().toISOString() : null;
    
    const result = await sql`
      INSERT INTO pages (
        id, title, slug, content, excerpt, author, status,
        featured_image, featured_image_alt, meta_title, meta_description, meta_keywords,
        template, show_in_navigation, navigation_order, parent_page_id, featured, published_at
      ) VALUES (
        ${id}, ${title}, ${slug}, ${content}, ${excerpt}, ${author}, ${status},
        ${featured_image}, ${featured_image_alt}, ${meta_title}, ${meta_description}, ${meta_keywords},
        ${template}, ${show_in_navigation}, ${navigation_order}, ${parent_page_id}, ${featured}, ${published_at}
      )
      RETURNING *
    `;
    
    return NextResponse.json(result[0], { status: 201 });
    
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}