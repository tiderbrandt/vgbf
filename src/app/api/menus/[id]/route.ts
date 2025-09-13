import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/database'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/menus/[id] - Get single menu item
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Try to parse as UUID first, then as slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    
    let result
    if (isUUID) {
      result = await sql`SELECT * FROM menu_items WHERE id = ${id}`
    } else {
      // If not UUID, search by title slug-like matching
      result = await sql`SELECT * FROM menu_items WHERE LOWER(REPLACE(title, ' ', '-')) = ${id.toLowerCase()}`
    }

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      )
    }

    // Get children if this is a parent item
    const children = await sql`
      SELECT * FROM menu_items 
      WHERE parent_id = ${result[0].id}
      ORDER BY sort_order, created_at
    `

    return NextResponse.json({
      menuItem: {
        ...result[0],
        children
      }
    })

  } catch (error) {
    console.error('Error fetching menu item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu item' },
      { status: 500 }
    )
  }
}

// PUT /api/menus/[id] - Update menu item
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const body = await request.json()

    // Check if menu item exists
    const existing = await sql`SELECT * FROM menu_items WHERE id = ${id}`
    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      )
    }

    const {
      title,
      url,
      target,
      menu_type,
      parent_id,
      sort_order,
      link_type,
      target_id,
      is_visible,
      is_published,
      requires_auth,
      show_on_mobile,
      show_on_desktop,
      css_class,
      icon,
      description
    } = body

    // Use simple update for Neon compatibility
    const result = await sql`
      UPDATE menu_items 
      SET 
        title = ${title || existing[0].title},
        url = ${url !== undefined ? url : existing[0].url},
        target = ${target !== undefined ? target : existing[0].target},
        menu_type = ${menu_type || existing[0].menu_type},
        parent_id = ${parent_id !== undefined ? parent_id : existing[0].parent_id},
        sort_order = ${sort_order !== undefined ? sort_order : existing[0].sort_order},
        link_type = ${link_type || existing[0].link_type},
        target_id = ${target_id !== undefined ? target_id : existing[0].target_id},
        is_visible = ${is_visible !== undefined ? is_visible : existing[0].is_visible},
        is_published = ${is_published !== undefined ? is_published : existing[0].is_published},
        requires_auth = ${requires_auth !== undefined ? requires_auth : existing[0].requires_auth},
        show_on_mobile = ${show_on_mobile !== undefined ? show_on_mobile : existing[0].show_on_mobile},
        show_on_desktop = ${show_on_desktop !== undefined ? show_on_desktop : existing[0].show_on_desktop},
        css_class = ${css_class !== undefined ? css_class : existing[0].css_class},
        icon = ${icon !== undefined ? icon : existing[0].icon},
        description = ${description !== undefined ? description : existing[0].description},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      menuItem: result[0],
      message: 'Menu item updated successfully'
    })

  } catch (error) {
    console.error('Error updating menu item:', error)
    return NextResponse.json(
      { error: 'Failed to update menu item' },
      { status: 500 }
    )
  }
}

// DELETE /api/menus/[id] - Delete menu item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params

    // Check if menu item exists
    const existing = await sql`SELECT * FROM menu_items WHERE id = ${id}`
    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      )
    }

    // Check if this item has children
    const children = await sql`SELECT COUNT(*) as count FROM menu_items WHERE parent_id = ${id}`
    const childCount = parseInt(children[0]?.count || '0')

    if (childCount > 0) {
      // Move children to be top-level items (or you could choose to delete them)
      await sql`UPDATE menu_items SET parent_id = NULL WHERE parent_id = ${id}`
    }

    // Delete the menu item
    await sql`DELETE FROM menu_items WHERE id = ${id}`

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
      childrenMoved: childCount
    })

  } catch (error) {
    console.error('Error deleting menu item:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    )
  }
}