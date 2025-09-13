import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/database'

export interface MenuItem {
  id: string
  title: string
  url: string | null
  target: string
  menu_type: string
  parent_id: string | null
  sort_order: number
  link_type: string
  target_id: string | null
  is_visible: boolean
  is_published: boolean
  requires_auth: boolean
  show_on_mobile: boolean
  show_on_desktop: boolean
  css_class: string | null
  icon: string | null
  description: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  children?: MenuItem[]
}

// Helper function to build hierarchical menu structure
function buildMenuTree(menuItems: MenuItem[]): MenuItem[] {
  const itemMap = new Map<string, MenuItem>()
  const rootItems: MenuItem[] = []

  // First pass: Create map and initialize children arrays
  menuItems.forEach(item => {
    item.children = []
    itemMap.set(item.id, item)
  })

  // Second pass: Build tree structure
  menuItems.forEach(item => {
    if (item.parent_id) {
      const parent = itemMap.get(item.parent_id)
      if (parent) {
        parent.children!.push(item)
      } else {
        // Parent not found, treat as root item
        rootItems.push(item)
      }
    } else {
      rootItems.push(item)
    }
  })

  // Sort items by sort_order
  const sortItems = (items: MenuItem[]) => {
    items.sort((a, b) => a.sort_order - b.sort_order)
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        sortItems(item.children)
      }
    })
  }

  sortItems(rootItems)
  return rootItems
}

// GET /api/menus - Get all menu items (optionally filtered by menu_type)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const menuType = searchParams.get('menu_type') || 'main'
    const tree = searchParams.get('tree') === 'true'
    const published = searchParams.get('published')

    let query = sql`
      SELECT * FROM menu_items 
      WHERE menu_type = ${menuType}
    `

    // Add published filter if specified
    if (published === 'true') {
      query = sql`
        SELECT * FROM menu_items 
        WHERE menu_type = ${menuType} AND is_published = true AND is_visible = true
      `
    }

    // Add order by clause
    const menuItems = await sql`
      SELECT * FROM menu_items 
      WHERE menu_type = ${menuType}
      ${published === 'true' ? sql`AND is_published = true AND is_visible = true` : sql``}
      ORDER BY 
        COALESCE(parent_id, id), 
        sort_order, 
        created_at
    `

    if (tree) {
      // Return hierarchical structure
      const treeStructure = buildMenuTree(menuItems as MenuItem[])
      return NextResponse.json({ menuItems: treeStructure })
    } else {
      // Return flat structure
      return NextResponse.json({ menuItems })
    }

  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    )
  }
}

// POST /api/menus - Create new menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      url,
      target = '_self',
      menu_type = 'main',
      parent_id,
      sort_order = 0,
      link_type = 'url',
      target_id,
      is_visible = true,
      is_published = true,
      requires_auth = false,
      show_on_mobile = true,
      show_on_desktop = true,
      css_class,
      icon,
      description
    } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // If sort_order is 0 or not provided, get the next available order
    let finalSortOrder = sort_order
    if (finalSortOrder === 0) {
      const maxOrder = await sql`
        SELECT COALESCE(MAX(sort_order), 0) as max_order 
        FROM menu_items 
        WHERE menu_type = ${menu_type} 
        ${parent_id ? sql`AND parent_id = ${parent_id}` : sql`AND parent_id IS NULL`}
      `
      finalSortOrder = (maxOrder[0]?.max_order || 0) + 1
    }

    const result = await sql`
      INSERT INTO menu_items (
        title, url, target, menu_type, parent_id, sort_order,
        link_type, target_id, is_visible, is_published, requires_auth,
        show_on_mobile, show_on_desktop, css_class, icon, description
      ) VALUES (
        ${title}, ${url}, ${target}, ${menu_type}, ${parent_id}, ${finalSortOrder},
        ${link_type}, ${target_id}, ${is_visible}, ${is_published}, ${requires_auth},
        ${show_on_mobile}, ${show_on_desktop}, ${css_class}, ${icon}, ${description}
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      menuItem: result[0],
      message: 'Menu item created successfully'
    })

  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    )
  }
}

// PUT /api/menus - Bulk update menu items (for reordering)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { menuItems } = body

    if (!Array.isArray(menuItems)) {
      return NextResponse.json(
        { error: 'menuItems must be an array' },
        { status: 400 }
      )
    }

    // Update each menu item's sort order and parent
    for (const item of menuItems) {
      await sql`
        UPDATE menu_items 
        SET 
          sort_order = ${item.sort_order},
          parent_id = ${item.parent_id || null},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${item.id}
      `
    }

    return NextResponse.json({
      success: true,
      message: 'Menu items updated successfully',
      updated: menuItems.length
    })

  } catch (error) {
    console.error('Error updating menu items:', error)
    return NextResponse.json(
      { error: 'Failed to update menu items' },
      { status: 500 }
    )
  }
}