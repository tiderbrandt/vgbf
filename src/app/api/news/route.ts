import { NextRequest, NextResponse } from 'next/server'
import { getAllNews, getFeaturedNews, getRecentNews, addNews, updateNews, deleteNews } from '@/lib/news-storage'
import { NewsArticle } from '@/types'

export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      success: true,
      data: news,
      count: news.length
    })
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
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

    return NextResponse.json({
      success: true,
      data: newArticle
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating news:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create news article' 
      }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Error updating news:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update news article' 
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
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

    return NextResponse.json({
      success: true,
      message: 'News article deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting news:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete news article' 
      }, 
      { status: 500 }
    )
  }
}
