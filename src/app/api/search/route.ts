import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/database'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const searchTerm = `%${query}%`

  try {
    // Parallel queries for better performance
    const [news, competitions, clubs, records] = await Promise.all([
      // Search News
      sql`
        SELECT id, title, slug, 'news' as type 
        FROM news 
        WHERE title ILIKE ${searchTerm} OR content ILIKE ${searchTerm}
        LIMIT 5
      `,
      // Search Competitions
      sql`
        SELECT id, title, 'competition' as type 
        FROM competitions 
        WHERE title ILIKE ${searchTerm} OR location ILIKE ${searchTerm}
        LIMIT 5
      `,
      // Search Clubs
      sql`
        SELECT id, name as title, 'club' as type 
        FROM clubs 
        WHERE name ILIKE ${searchTerm} OR city ILIKE ${searchTerm}
        LIMIT 5
      `,
      // Search Records
      sql`
        SELECT id, name || ' - ' || score || 'p' as title, 'record' as type 
        FROM records 
        WHERE name ILIKE ${searchTerm} OR club ILIKE ${searchTerm}
        LIMIT 5
      `
    ])

    // Normalize results
    const normalize = (result: any, urlPrefix: string) => {
      const items = Array.isArray(result) ? result : (result.rows || [])
      return items.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        url: item.type === 'news' ? `/nyheter/${item.slug}` : 
             item.type === 'club' ? `/klubbar/${item.id}` :
             item.type === 'competition' ? `/tavlingar` : // Competitions don't have individual pages yet
             `/distriktsrekord`
      }))
    }

    const results = [
      ...normalize(news, '/nyheter'),
      ...normalize(competitions, '/tavlingar'),
      ...normalize(clubs, '/klubbar'),
      ...normalize(records, '/distriktsrekord')
    ]

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
