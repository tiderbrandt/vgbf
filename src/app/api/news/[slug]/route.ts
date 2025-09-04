import { NextRequest, NextResponse } from 'next/server'
import { getNewsBySlug, updateNews, deleteNews } from '@/lib/news-storage-blob'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const news = await getNewsBySlug(params.slug)
    
    if (!news) {
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
      data: news
    })
  } catch (error) {
    console.error('Error fetching news article:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch news article' 
      }, 
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json()
    const existingNews = await getNewsBySlug(params.slug)
    
    if (!existingNews) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'News article not found' 
        }, 
        { status: 404 }
      )
    }

    const updatedNews = await updateNews(existingNews.id, body)

    return NextResponse.json({
      success: true,
      data: updatedNews
    })
  } catch (error) {
    console.error('Error updating news article:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update news article' 
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const existingNews = await getNewsBySlug(params.slug)
    
    if (!existingNews) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'News article not found' 
        }, 
        { status: 404 }
      )
    }

    const deleted = await deleteNews(existingNews.id)

    if (!deleted) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete news article' 
        }, 
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'News article deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting news article:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete news article' 
      }, 
      { status: 500 }
    )
  }
}
