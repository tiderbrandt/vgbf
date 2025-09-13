import { sql } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/pages/generate-slug - Generate a unique slug from title
export async function POST(request: NextRequest) {
  try {
    const { title, excludeId } = await request.json();
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }
    
    // Generate base slug from title
    let baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[åä]/g, 'a')
      .replace(/[ö]/g, 'o')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    if (!baseSlug) {
      baseSlug = 'page';
    }
    
    // Check if slug exists
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      let query = sql`SELECT id FROM pages WHERE slug = ${slug}`;
      
      // Exclude specific ID if updating
      if (excludeId) {
        query = sql`SELECT id FROM pages WHERE slug = ${slug} AND id != ${excludeId}`;
      }
      
      const existing = await query;
      
      if (existing.length === 0) {
        break;
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return NextResponse.json({ slug });
    
  } catch (error) {
    console.error('Error generating slug:', error);
    return NextResponse.json(
      { error: 'Failed to generate slug' },
      { status: 500 }
    );
  }
}