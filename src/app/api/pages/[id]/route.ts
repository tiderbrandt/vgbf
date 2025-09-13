import { sql } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/pages/[id] - Get a single page by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Try to find by ID first, then by slug
    let page;
    
    // Check if it looks like a UUID (has correct format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (uuidRegex.test(id)) {
      page = await sql`
        SELECT * FROM pages WHERE id = ${id}
      `;
    } else {
      page = await sql`
        SELECT * FROM pages WHERE slug = ${id}
      `;
    }
    
    if (!page || page.length === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }
    
    // Increment view count for published pages
    if (page[0].status === 'published') {
      await sql`
        UPDATE pages 
        SET view_count = view_count + 1 
        WHERE id = ${page[0].id}
      `;
      page[0].view_count += 1;
    }
    
    return NextResponse.json(page[0]);
    
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

// PUT /api/pages/[id] - Update a page
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      title,
      slug,
      content,
      excerpt,
      author,
      status,
      featured_image,
      featured_image_alt,
      meta_title,
      meta_description,
      meta_keywords,
      template,
      show_in_navigation,
      navigation_order,
      parent_page_id,
      featured
    } = body;
    
    // Check if page exists
    const existingPage = await sql`
      SELECT * FROM pages WHERE id = ${id}
    `;
    
    if (!existingPage || existingPage.length === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }
    
    // Check if slug conflicts with another page
    if (slug && slug !== existingPage[0].slug) {
      const slugConflict = await sql`
        SELECT id FROM pages WHERE slug = ${slug} AND id != ${id}
      `;
      
      if (slugConflict.length > 0) {
        return NextResponse.json(
          { error: 'A page with this slug already exists' },
          { status: 409 }
        );
      }
    }
    
    // Set published_at if status changes to published
    let published_at = existingPage[0].published_at;
    if (status === 'published' && existingPage[0].status !== 'published') {
      published_at = new Date().toISOString();
    }
    
    const result = await sql`
      UPDATE pages SET
        title = COALESCE(${title}, title),
        slug = COALESCE(${slug}, slug),
        content = COALESCE(${content}, content),
        excerpt = COALESCE(${excerpt}, excerpt),
        author = COALESCE(${author}, author),
        status = COALESCE(${status}, status),
        featured_image = COALESCE(${featured_image}, featured_image),
        featured_image_alt = COALESCE(${featured_image_alt}, featured_image_alt),
        meta_title = COALESCE(${meta_title}, meta_title),
        meta_description = COALESCE(${meta_description}, meta_description),
        meta_keywords = COALESCE(${meta_keywords}, meta_keywords),
        template = COALESCE(${template}, template),
        show_in_navigation = COALESCE(${show_in_navigation}, show_in_navigation),
        navigation_order = COALESCE(${navigation_order}, navigation_order),
        parent_page_id = COALESCE(${parent_page_id}, parent_page_id),
        featured = COALESCE(${featured}, featured),
        published_at = ${published_at}
      WHERE id = ${id}
      RETURNING *
    `;
    
    return NextResponse.json(result[0]);
    
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// DELETE /api/pages/[id] - Delete a page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Check if page exists
    const existingPage = await sql`
      SELECT * FROM pages WHERE id = ${id}
    `;
    
    if (!existingPage || existingPage.length === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }
    
    // Check if page has children
    const childPages = await sql`
      SELECT id FROM pages WHERE parent_page_id = ${id}
    `;
    
    if (childPages.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete page with child pages. Delete or reassign child pages first.' },
        { status: 409 }
      );
    }
    
    await sql`
      DELETE FROM pages WHERE id = ${id}
    `;
    
    return NextResponse.json({ message: 'Page deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}