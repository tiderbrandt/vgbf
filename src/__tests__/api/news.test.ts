/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from '@/app/api/news/route'
import { 
  createMockNewsArticle, 
  createMockRequest, 
  createAuthHeaders,
  setupTest,
  teardownTest 
} from '@/test-utils/test-helpers'

// Mock the storage functions
jest.mock('@/lib/news-storage-postgres')
jest.mock('@/lib/auth')

const mockNewsStorage = {
  getAllNews: require('@/lib/news-storage-postgres').getAllNews,
  getFeaturedNews: require('@/lib/news-storage-postgres').getFeaturedNews,
  getRecentNews: require('@/lib/news-storage-postgres').getRecentNews,
  addNews: require('@/lib/news-storage-postgres').addNews,
  updateNews: require('@/lib/news-storage-postgres').updateNews,
  deleteNews: require('@/lib/news-storage-postgres').deleteNews,
}

const mockAuth = {
  verifyAdminAuth: require('@/lib/auth').verifyAdminAuth,
  createUnauthorizedResponse: require('@/lib/auth').createUnauthorizedResponse,
}

describe('/api/news API Routes', () => {
  beforeEach(() => {
    setupTest()
    jest.clearAllMocks()
  })

  afterEach(() => {
    teardownTest()
  })

  describe('GET /api/news', () => {
    const mockNews = [
      createMockNewsArticle({ id: '1', title: 'News 1' }),
      createMockNewsArticle({ id: '2', title: 'News 2', featured: true }),
      createMockNewsArticle({ id: '3', title: 'News 3' }),
    ]

    it('should return all news articles by default', async () => {
      mockNewsStorage.getAllNews.mockResolvedValue(mockNews)

      const request = createMockRequest('GET', 'http://localhost:3000/api/news')
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        success: true,
        data: mockNews,
        count: mockNews.length,
      })
      expect(mockNewsStorage.getAllNews).toHaveBeenCalledTimes(1)
    })

    it('should return featured news when type=featured', async () => {
      const featuredNews = [mockNews[1]] // Only the featured one
      mockNewsStorage.getFeaturedNews.mockResolvedValue(featuredNews)

      const request = createMockRequest('GET', 'http://localhost:3000/api/news?type=featured')
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        success: true,
        data: featuredNews,
        count: featuredNews.length,
      })
      expect(mockNewsStorage.getFeaturedNews).toHaveBeenCalledTimes(1)
    })

    it('should return recent news when type=recent', async () => {
      const recentNews = mockNews.slice(0, 2)
      mockNewsStorage.getRecentNews.mockResolvedValue(recentNews)

      const request = createMockRequest('GET', 'http://localhost:3000/api/news?type=recent&limit=2')
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        success: true,
        data: recentNews,
        count: recentNews.length,
      })
      expect(mockNewsStorage.getRecentNews).toHaveBeenCalledWith(2)
    })

    it('should use default limit of 4 for recent news when limit not specified', async () => {
      mockNewsStorage.getRecentNews.mockResolvedValue(mockNews)

      const request = createMockRequest('GET', 'http://localhost:3000/api/news?type=recent')
      const response = await GET(request)

      expect(mockNewsStorage.getRecentNews).toHaveBeenCalledWith(4)
    })

    it('should handle storage errors gracefully', async () => {
      mockNewsStorage.getAllNews.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest('GET', 'http://localhost:3000/api/news')
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        success: false,
        error: 'Failed to fetch news',
      })
    })

    it('should set proper cache control headers', async () => {
      mockNewsStorage.getAllNews.mockResolvedValue(mockNews)

      const request = createMockRequest('GET', 'http://localhost:3000/api/news')
      const response = await GET(request)

      expect(response.headers.get('Cache-Control')).toBe('no-store, no-cache, must-revalidate, proxy-revalidate')
      expect(response.headers.get('Pragma')).toBe('no-cache')
      expect(response.headers.get('Expires')).toBe('0')
    })
  })

  describe('POST /api/news', () => {
    const newArticleData = {
      title: 'New Article',
      excerpt: 'New excerpt',
      content: 'New content',
      author: 'New Author',
      slug: 'new-article',
      featured: false,
      tags: ['new'],
    }

    it('should create a new news article when authenticated', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      const createdArticle = createMockNewsArticle({ ...newArticleData, id: '123' })
      mockNewsStorage.addNews.mockResolvedValue(createdArticle)

      const request = createMockRequest(
        'POST',
        'http://localhost:3000/api/news',
        newArticleData,
        createAuthHeaders()
      )

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(201)
      expect(responseData).toEqual({
        success: true,
        data: createdArticle,
      })
      expect(mockNewsStorage.addNews).toHaveBeenCalledWith(
        expect.objectContaining({
          title: newArticleData.title,
          excerpt: newArticleData.excerpt,
          content: newArticleData.content,
          author: newArticleData.author,
          slug: newArticleData.slug,
          featured: newArticleData.featured,
          tags: newArticleData.tags,
          date: expect.any(String),
          imageUrl: '',
          imageAlt: '',
        })
      )
    })

    it('should return 401 when not authenticated', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(false)
      mockAuth.createUnauthorizedResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )

      const request = createMockRequest('POST', 'http://localhost:3000/api/news', newArticleData)
      const response = await POST(request)

      expect(response.status).toBe(401)
      expect(mockNewsStorage.addNews).not.toHaveBeenCalled()
    })

    it('should handle storage errors during creation', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      mockNewsStorage.addNews.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest(
        'POST',
        'http://localhost:3000/api/news',
        newArticleData,
        createAuthHeaders()
      )

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        success: false,
        error: 'Failed to create news article',
        details: 'Database error',
      })
    })

    it('should set default date when not provided', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      const createdArticle = createMockNewsArticle(newArticleData)
      mockNewsStorage.addNews.mockResolvedValue(createdArticle)

      const request = createMockRequest(
        'POST',
        'http://localhost:3000/api/news',
        newArticleData,
        createAuthHeaders()
      )

      await POST(request)

      expect(mockNewsStorage.addNews).toHaveBeenCalledWith(
        expect.objectContaining({
          date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        })
      )
    })
  })

  describe('PUT /api/news', () => {
    const updateData = {
      id: '123',
      title: 'Updated Article',
      excerpt: 'Updated excerpt',
      content: 'Updated content',
    }

    it('should update an existing news article when authenticated', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      const updatedArticle = createMockNewsArticle(updateData)
      mockNewsStorage.updateNews.mockResolvedValue(updatedArticle)

      const request = createMockRequest(
        'PUT',
        'http://localhost:3000/api/news',
        updateData,
        createAuthHeaders()
      )

      const response = await PUT(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        success: true,
        data: updatedArticle,
      })
      expect(mockNewsStorage.updateNews).toHaveBeenCalledWith('123', updateData)
    })

    it('should return 401 when not authenticated', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(false)
      mockAuth.createUnauthorizedResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )

      const request = createMockRequest('PUT', 'http://localhost:3000/api/news', updateData)
      const response = await PUT(request)

      expect(response.status).toBe(401)
      expect(mockNewsStorage.updateNews).not.toHaveBeenCalled()
    })

    it('should return 400 when id is missing', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      const dataWithoutId = { title: 'Updated Article' }

      const request = createMockRequest(
        'PUT',
        'http://localhost:3000/api/news',
        dataWithoutId,
        createAuthHeaders()
      )

      const response = await PUT(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData).toEqual({
        success: false,
        error: 'News article ID is required for update',
      })
    })

    it('should return 404 when article not found', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      mockNewsStorage.updateNews.mockResolvedValue(null)

      const request = createMockRequest(
        'PUT',
        'http://localhost:3000/api/news',
        updateData,
        createAuthHeaders()
      )

      const response = await PUT(request)
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData).toEqual({
        success: false,
        error: 'News article not found',
      })
    })

    it('should handle storage errors during update', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      mockNewsStorage.updateNews.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest(
        'PUT',
        'http://localhost:3000/api/news',
        updateData,
        createAuthHeaders()
      )

      const response = await PUT(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        success: false,
        error: 'Failed to update news article',
      })
    })
  })

  describe('DELETE /api/news', () => {
    it('should delete a news article when authenticated and id provided', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      mockNewsStorage.deleteNews.mockResolvedValue(true)

      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/news?id=123',
        null,
        createAuthHeaders()
      )

      const response = await DELETE(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        success: true,
        message: 'News article deleted successfully',
      })
      expect(mockNewsStorage.deleteNews).toHaveBeenCalledWith('123')
    })

    it('should return 401 when not authenticated', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(false)
      mockAuth.createUnauthorizedResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )

      const request = createMockRequest('DELETE', 'http://localhost:3000/api/news?id=123')
      const response = await DELETE(request)

      expect(response.status).toBe(401)
      expect(mockNewsStorage.deleteNews).not.toHaveBeenCalled()
    })

    it('should return 400 when id is missing', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)

      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/news',
        null,
        createAuthHeaders()
      )

      const response = await DELETE(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData).toEqual({
        success: false,
        error: 'News article ID is required for deletion',
      })
    })

    it('should return 404 when article not found', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      mockNewsStorage.deleteNews.mockResolvedValue(false)

      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/news?id=999',
        null,
        createAuthHeaders()
      )

      const response = await DELETE(request)
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData).toEqual({
        success: false,
        error: 'News article not found',
      })
    })

    it('should handle storage errors during deletion', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      mockNewsStorage.deleteNews.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/news?id=123',
        null,
        createAuthHeaders()
      )

      const response = await DELETE(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        success: false,
        error: 'Failed to delete news article',
      })
    })
  })
})
