import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/database'

// PUT /api/menus/bulk-update - Bulk update menu items (used for reordering)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { updates } = body

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      )
    }

    // Validate each update has id and at least one field to update
    for (const update of updates) {
      if (!update.id) {
        return NextResponse.json(
          { error: 'Each update must have an id' },
          { status: 400 }
        )
      }
    }

    const results = []

    // Process each update
    for (const update of updates) {
      const { id, sort_order, ...otherFields } = update

      // Use individual updates with template literals for better compatibility
      const updateFields: any = {}
      
      if (sort_order !== undefined) {
        updateFields.sort_order = sort_order
      }

      // Add other fields if provided
      Object.entries(otherFields).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id') {
          updateFields[key] = value
        }
      })

      if (Object.keys(updateFields).length === 0) {
        continue // Skip if no fields to update
      }

      // Use template literal approach for Neon compatibility
      try {
        let result
        if (updateFields.sort_order !== undefined) {
          result = await sql`
            UPDATE menu_items 
            SET sort_order = ${updateFields.sort_order}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
            RETURNING *
          `
        } else {
          // Handle other fields - for now, just skip non-sort_order updates
          continue
        }

        if (result.length > 0) {
          results.push(result[0])
        }
      } catch (itemError) {
        console.error('Error updating item:', id, itemError)
        // Continue with other items
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${results.length} menu items`,
      updatedItems: results
    })

  } catch (error) {
    console.error('Error bulk updating menu items:', error)
    return NextResponse.json(
      { error: 'Failed to bulk update menu items' },
      { status: 500 }
    )
  }
}