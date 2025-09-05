import { NextResponse } from 'next/server'

interface RSSItem {
  title: string
  description: string
  link: string
  pubDate: string
  guid: string
}

interface ExternalNewsItem {
  id: string
  title: string
  excerpt: string
  url: string
  date: string
  source: string
}

// Parse RSS XML to extract news items
function parseRSSXML(xmlText: string): RSSItem[] {
  const items: RSSItem[] = []
  
  // Extract items using regex (simple XML parsing)
  const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/g)
  
  if (!itemMatches) return items
  
  itemMatches.forEach(itemXML => {
    const title = itemXML.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[1] || 
                  itemXML.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[2] || ''
    const description = itemXML.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)?.[1] ||
                       itemXML.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)?.[2] || ''
    const link = itemXML.match(/<link>(.*?)<\/link>/)?.[1] || ''
    const pubDate = itemXML.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
    const guid = itemXML.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1] || link
    
    if (title && link) {
      items.push({
        title: title.trim(),
        description: description.trim().replace(/<[^>]*>/g, ''), // Strip HTML tags
        link: link.trim(),
        pubDate: pubDate.trim(),
        guid: guid.trim()
      })
    }
  })
  
  return items
}

// Convert RSS items to our news format
function convertToExternalNews(rssItems: RSSItem[]): ExternalNewsItem[] {
  return rssItems.map(item => {
    // Parse pubDate to ISO string
    let isoDate = new Date().toISOString()
    if (item.pubDate) {
      try {
        isoDate = new Date(item.pubDate).toISOString()
      } catch {
        // Keep current date if parsing fails
      }
    }
    
    return {
      id: `rf-${Buffer.from(item.guid || item.link).toString('base64').slice(0, 10)}`,
      title: item.title,
      excerpt: item.description.length > 200 
        ? item.description.substring(0, 200) + '...' 
        : item.description,
      url: item.link,
      date: isoDate,
      source: 'Riksidrottsförbundet'
    }
  })
}

export async function GET() {
  try {
    // Fetch RSS feed from Riksidrottsförbundet
    const fetchOptions: RequestInit = {
      next: { revalidate: 3600 } // Cache for 1 hour
    }

    // In development, ignore SSL certificate errors
    if (process.env.NODE_ENV === 'development') {
      // For development, we'll use a different approach if fetch fails
      try {
        const response = await fetch('https://www.rf.se/rss-alla-nyheter', fetchOptions)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch RSS: ${response.status}`)
        }
        
        const xmlText = await response.text()
        const rssItems = parseRSSXML(xmlText)
        const externalNews = convertToExternalNews(rssItems)
        
        // Return only the 3 most recent items
        const recentNews = externalNews
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3)
        
        return NextResponse.json(recentNews)
      } catch (devError) {
        console.log('Development mode: RSS fetch failed, returning mock data for testing')
        // Return mock data for development testing
        const mockNews: ExternalNewsItem[] = [
          {
            id: 'rf-mock-1',
            title: 'Ny satsning på ungdomsidrott',
            excerpt: 'Riksidrottsförbundet lanserar en ny satsning för att stärka ungdomsidrotten i Sverige. Satsningen innebär ökade resurser för föreningar.',
            url: 'https://www.rf.se',
            date: new Date().toISOString(),
            source: 'Riksidrottsförbundet'
          },
          {
            id: 'rf-mock-2',
            title: 'Nya regler för tävlingsverksamhet',
            excerpt: 'Från nästa säsong träder nya regler i kraft för tävlingsverksamheten. Läs mer om vad som ändras.',
            url: 'https://www.rf.se',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            source: 'Riksidrottsförbundet'
          }
        ]
        return NextResponse.json(mockNews)
      }
    } else {
      // Production environment
      const response = await fetch('https://www.rf.se/rss-alla-nyheter', fetchOptions)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch RSS: ${response.status}`)
      }
      
      const xmlText = await response.text()
      const rssItems = parseRSSXML(xmlText)
      const externalNews = convertToExternalNews(rssItems)
      
      // Return only the 3 most recent items
      const recentNews = externalNews
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
      
      return NextResponse.json(recentNews)
    }
  } catch (error) {
    console.error('Error fetching external news:', error)
    return NextResponse.json([], { status: 200 }) // Return empty array on error
  }
}
