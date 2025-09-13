import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/database'

export async function POST() {
  try {
    console.log('Creating menu management tables...')

    // Create menu_items table
    await sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        
        -- Basic menu item properties
        title VARCHAR(255) NOT NULL,
        url VARCHAR(500), -- Can be relative URL, absolute URL, or NULL for parent items
        target VARCHAR(50) DEFAULT '_self', -- _self, _blank, etc.
        
        -- Menu structure
        menu_type VARCHAR(100) DEFAULT 'main', -- 'main', 'footer', 'sidebar', etc.
        parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
        sort_order INTEGER DEFAULT 0,
        
        -- Link type and target
        link_type VARCHAR(50) DEFAULT 'url', -- 'url', 'page', 'news', 'external', 'custom'
        target_id UUID, -- ID of linked page/news article if link_type is 'page' or 'news'
        
        -- Visibility and permissions
        is_visible BOOLEAN DEFAULT true,
        is_published BOOLEAN DEFAULT true,
        requires_auth BOOLEAN DEFAULT false,
        show_on_mobile BOOLEAN DEFAULT true,
        show_on_desktop BOOLEAN DEFAULT true,
        
        -- CSS and styling
        css_class VARCHAR(255),
        icon VARCHAR(100), -- Icon name or class
        description TEXT, -- For tooltips or accessibility
        
        -- Metadata
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by UUID, -- User ID who created this menu item
        updated_by UUID  -- User ID who last updated this menu item
      )
    `

    console.log('Creating indexes...')

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_menu_type ON menu_items(menu_type)`
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(sort_order)`
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_is_published ON menu_items(is_published)`
    await sql`CREATE INDEX IF NOT EXISTS idx_menu_items_target_id ON menu_items(target_id)`

    console.log('Checking for existing menu items...')

    // Check if menu items already exist
    const existingMenus = await sql`SELECT COUNT(*) as count FROM menu_items WHERE menu_type = 'main'`
    const menuCount = parseInt(existingMenus[0]?.count || '0')

    if (menuCount === 0) {
      console.log('Inserting default menu structure...')

      // Insert default menu structure based on current navigation
      const defaultMenuItems = [
        { title: 'Hem', url: '/', sort_order: 1 },
        { title: 'Nyheter', url: '/nyheter', sort_order: 2 },
        { title: 'Tävlingar', url: '/tavlingar', sort_order: 3 },
        { title: 'Klubbar', url: '/klubbar', sort_order: 4 },
        { title: 'Kalender', url: '/kalender', sort_order: 5 },
        { title: 'Distriktsrekord', url: '/distriktsrekord', sort_order: 6 },
        { title: 'Styrelsen', url: '/styrelsen', sort_order: 7 },
        { title: 'Kontakt', url: '/kontakt', sort_order: 8 }
      ]

      for (const item of defaultMenuItems) {
        await sql`
          INSERT INTO menu_items (title, url, menu_type, sort_order, link_type, is_visible, is_published)
          VALUES (${item.title}, ${item.url}, 'main', ${item.sort_order}, 'url', true, true)
        `
      }

      // Get the Tävlingar menu item ID for submenu
      const tavlingarMenu = await sql`
        SELECT id FROM menu_items WHERE title = 'Tävlingar' AND menu_type = 'main' LIMIT 1
      `

      if (tavlingarMenu.length > 0) {
        const parentId = tavlingarMenu[0].id

        const subMenuItems = [
          { title: 'Kommande tävlingar', url: '/tavlingar/kommande', sort_order: 1 },
          { title: 'Pågående tävlingar', url: '/tavlingar/pagaende', sort_order: 2 },
          { title: 'Avslutade tävlingar', url: '/tavlingar/avslutade', sort_order: 3 }
        ]

        for (const item of subMenuItems) {
          await sql`
            INSERT INTO menu_items (title, url, menu_type, parent_id, sort_order, link_type, is_visible, is_published)
            VALUES (${item.title}, ${item.url}, 'main', ${parentId}, ${item.sort_order}, 'url', true, true)
          `
        }
      }

      console.log('Default menu structure created successfully')
    } else {
      console.log(`Found ${menuCount} existing menu items, skipping default data`)
    }

    // Get the final menu structure for response
    const allMenus = await sql`
      SELECT 
        m.*,
        CASE 
          WHEN m.parent_id IS NULL THEN 0
          ELSE 1
        END as level
      FROM menu_items m 
      WHERE m.menu_type = 'main' 
      ORDER BY 
        COALESCE(m.parent_id, m.id), 
        m.sort_order, 
        m.created_at
    `

    return NextResponse.json({ 
      success: true, 
      message: 'Menu management system created successfully',
      menuItems: allMenus,
      created: menuCount === 0
    })

  } catch (error) {
    console.error('Error creating menu management system:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create menu management system',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Check if menu_items table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'menu_items'
      )
    `

    if (!tableExists[0]?.exists) {
      return NextResponse.json({ 
        exists: false, 
        message: 'Menu management system not yet created' 
      })
    }

    // Get current menu structure
    const allMenus = await sql`
      SELECT 
        m.*,
        CASE 
          WHEN m.parent_id IS NULL THEN 0
          ELSE 1
        END as level
      FROM menu_items m 
      WHERE m.menu_type = 'main' 
      ORDER BY 
        COALESCE(m.parent_id, m.id), 
        m.sort_order, 
        m.created_at
    `

    return NextResponse.json({ 
      exists: true, 
      menuItems: allMenus,
      count: allMenus.length
    })

  } catch (error) {
    console.error('Error checking menu management system:', error)
    return NextResponse.json({ 
      error: 'Failed to check menu management system',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}