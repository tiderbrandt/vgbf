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

      // Build the update query dynamically
      const fields = []
      const values = []

      if (sort_order !== undefined) {
        fields.push('sort_order')
        values.push(sort_order)
      }

      // Add other fields if provided
      Object.entries(otherFields).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id') {
          fields.push(key)
          values.push(value)
        }
      })

      if (fields.length === 0) {
        continue // Skip if no fields to update
      }

      // Create parameterized query
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')
      
      const result = await sql.unsafe(`
        UPDATE menu_items 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `, [id, ...values])

      if (result.length > 0) {
        results.push(result[0])
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