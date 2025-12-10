import { NextRequest, NextResponse } from 'next/server'
import { getAllNews, getFeaturedNews, getRecentNews, addNews, updateNews, deleteNews } from '@/lib/news-storage-postgres'
import { NewsArticle } from '@/types'
import { withAuth } from '@/lib/api/withAuth'

// Force this route to be dynamic for admin operations
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  console.log('GET /api/news called')
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const limit = searchParams.get('limit')

  try {
    let news
    
    switch (type) {
      case 'featured':
        news = await getFeaturedNews()
        break
      case 'recent':
        const limitNum = limit ? parseInt(limit) : 4
        news = await getRecentNews(limitNum)
        break
      default:
        news = await getAllNews()
    }

    const response = NextResponse.json({
      success: true,
      data: news,
      count: news.length
    })
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch news' 
      }, 
      { status: 500 }
    )
  }
}

export const POST = withAuth(async (request: NextRequest) => {
  console.log('POST /api/news called')
  
  console.log('Authentication successful')

  const body = await request.json()
  console.log('Request body received:', { title: body.title })
  
  const newsData: Omit<NewsArticle, 'id'> = {
    title: body.title,
    excerpt: body.excerpt,
    content: body.content,
    date: body.date || new Date().toISOString().split('T')[0],
    author: body.author,
    slug: body.slug,
    featured: body.featured || false,
    tags: body.tags || [],
    imageUrl: body.imageUrl || '',
    imageAlt: body.imageAlt || ''
  }

  const newArticle = await addNews(newsData)
  console.log('News article created successfully:', newArticle.id)

  return NextResponse.json({
    success: true,
    data: newArticle
  }, { status: 201 })
})

export const PUT = withAuth(async (request: NextRequest) => {
  console.log('PUT /api/news called')
  
  const body = await request.json()
  
  if (!body.id) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'News article ID is required for update' 
      }, 
      { status: 400 }
    )
  }

  const updatedArticle = await updateNews(body.id, body)

  if (!updatedArticle) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'News article not found' 
      }, 
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    data: updatedArticle
  })
})

export const DELETE = withAuth(async (request: NextRequest) => {
  console.log('DELETE /api/news called')
  
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  console.log('Deleting news with ID:', id)
  
  if (!id) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'News article ID is required for deletion' 
      }, 
      { status: 400 }
    )
  }

  const deleted = await deleteNews(id)

  if (!deleted) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'News article not found' 
      }, 
      { status: 404 }
    )
  }

  console.log('News deleted successfully:', id)
  return NextResponse.json({
    success: true,
    message: 'News article deleted successfully'
  })
})
