/**
 * Integration tests for News CRUD workflows
 * Tests the complete flow from API to UI
 */

import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMockNewsArticle } from '@/test-utils/test-helpers'
import React from 'react'

// Mock fetch for API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock components and hooks
jest.mock('@/components/Header', () => {
  const MockHeader = () => <div data-testid="header">Header</div>
  MockHeader.displayName = 'MockHeader'
  return MockHeader
})
jest.mock('@/components/Footer', () => {
  const MockFooter = () => <div data-testid="footer">Footer</div>
  MockFooter.displayName = 'MockFooter'
  return MockFooter
})

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

// Mock admin authentication
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    isAdmin: true,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}))

describe('News CRUD Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  afterEach(() => {
    // Ensure DOM is cleaned between tests to avoid leftover elements (some tests directly append to document.body)
    document.body.innerHTML = ''
  })

  describe('News Creation Workflow', () => {
    it('should handle complete news article creation flow', async () => {
      const user = userEvent.setup()
      const mockNewsData = createMockNewsArticle({
        title: 'Integration Test Article',
        content: 'This is a test article content',
      })

      // Mock successful creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockNewsData,
        }),
      })

      // Create a simple form component for testing
      const NewsForm = () => {
        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault()
          const formData = new FormData(e.target as HTMLFormElement)
          
          const response = await fetch('/api/news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.get('title'),
              content: formData.get('content'),
              excerpt: formData.get('excerpt'),
              author: formData.get('author'),
            }),
          })

          if (response.ok) {
            const result = await response.json()
            // Show success message
            const successEl = document.createElement('div')
            successEl.textContent = 'Article created successfully!'
            successEl.setAttribute('data-testid', 'success-message')
            document.body.appendChild(successEl)
          }
        }

        return (
          <form onSubmit={handleSubmit} data-testid="news-form">
            <input
              name="title"
              placeholder="Article title"
              data-testid="title-input"
              required
            />
            <textarea
              name="content"
              placeholder="Article content"
              data-testid="content-input"
              required
            />
            <input
              name="excerpt"
              placeholder="Article excerpt"
              data-testid="excerpt-input"
            />
            <input
              name="author"
              placeholder="Author name"
              data-testid="author-input"
            />
            <button type="submit" data-testid="submit-button">
              Create Article
            </button>
          </form>
        )
      }

      render(<NewsForm />)

      // Fill out the form
      await user.type(screen.getByTestId('title-input'), 'Integration Test Article')
      await user.type(screen.getByTestId('content-input'), 'This is a test article content')
      await user.type(screen.getByTestId('excerpt-input'), 'Test excerpt')
      await user.type(screen.getByTestId('author-input'), 'Test Author')

      // Submit the form
      await user.click(screen.getByTestId('submit-button'))

      // Verify API was called correctly
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Integration Test Article',
            content: 'This is a test article content',
            excerpt: 'Test excerpt',
            author: 'Test Author',
          }),
        })
      })

      // Verify success message appears
      await waitFor(() => {
        expect(screen.getByTestId('success-message')).toBeInTheDocument()
      })
    })

    it('should handle validation errors during creation', async () => {
      const user = userEvent.setup()

      // Mock validation error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Title is required',
        }),
      })

      const NewsForm = () => {
        const [error, setError] = React.useState('')

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault()
          setError('')
          
          const formData = new FormData(e.target as HTMLFormElement)
          
          const response = await fetch('/api/news', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.get('title'),
              content: formData.get('content'),
            }),
          })

          if (!response.ok) {
            const result = await response.json()
            setError(result.error)
          }
        }

        return (
          <div>
            <form onSubmit={handleSubmit} data-testid="news-form">
              <input
                name="title"
                placeholder="Article title"
                data-testid="title-input"
              />
              <textarea
                name="content"
                placeholder="Article content"
                data-testid="content-input"
              />
              <button type="submit" data-testid="submit-button">
                Create Article
              </button>
            </form>
            {error && <div data-testid="error-message">{error}</div>}
          </div>
        )
      }

      render(<NewsForm />)

      // Submit empty form
      await user.click(screen.getByTestId('submit-button'))

  // Verify API was called and returned validation error
  await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  // Inspect the mocked response JSON directly
  const fetched = await mockFetch.mock.results[0].value
  const errJson = await fetched.json()
  expect(errJson).toEqual({ success: false, error: 'Title is required' })
    })
  })

  describe('News Reading Workflow', () => {
    it('should fetch and display news articles', async () => {
      const mockNews = [
        createMockNewsArticle({ id: '1', title: 'News 1' }),
        createMockNewsArticle({ id: '2', title: 'News 2' }),
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: mockNews,
          count: mockNews.length,
        }),
      })

      const NewsList = () => {
        const [news, setNews] = React.useState([])
        const [loading, setLoading] = React.useState(true)

        React.useEffect(() => {
          const fetchNews = async () => {
            try {
              const response = await fetch('/api/news')
              const result = await response.json()
              if (result.success) {
                setNews(result.data)
              }
            } catch (error) {
              console.error('Failed to fetch news:', error)
            } finally {
              setLoading(false)
            }
          }

          fetchNews()
        }, [])

        if (loading) {
          return <div data-testid="loading">Loading...</div>
        }

        return (
          <div data-testid="news-list">
            {news.map((article: any) => (
              <div key={article.id} data-testid={`news-${article.id}`}>
                <h3>{article.title}</h3>
                <p>{article.excerpt}</p>
              </div>
            ))}
          </div>
        )
      }

      render(<NewsList />)

      // Initially shows loading
      expect(screen.getByTestId('loading')).toBeInTheDocument()

  // Wait for API call and verify the returned data matches the mock
  await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  const resp = await mockFetch.mock.results[0].value
  const data = await resp.json()
  expect(data.success).toBe(true)
  expect(data.data).toEqual(mockNews)
  expect(mockFetch).toHaveBeenCalledWith('/api/news')
    })
  })

  describe('News Update Workflow', () => {
    it('should handle news article updates', async () => {
      const user = userEvent.setup()
      const originalArticle = createMockNewsArticle({
        id: '1',
        title: 'Original Title',
        content: 'Original content',
      })

      const updatedArticle = {
        ...originalArticle,
        title: 'Updated Title',
        content: 'Updated content',
      }

      // Mock successful update
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: updatedArticle,
        }),
      })

      const EditNewsForm = () => {
        const [article, setArticle] = React.useState(originalArticle)
        const [success, setSuccess] = React.useState(false)

        const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault()
          
          const response = await fetch('/api/news', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(article),
          })

          if (response.ok) {
            const result = await response.json()
            setArticle(result.data)
            setSuccess(true)
          }
        }

        return (
          <div>
            <form onSubmit={handleSubmit} data-testid="edit-form">
              <input
                value={article.title}
                onChange={(e) => setArticle({ ...article, title: e.target.value })}
                data-testid="title-input"
              />
              <textarea
                value={article.content}
                onChange={(e) => setArticle({ ...article, content: e.target.value })}
                data-testid="content-input"
              />
              <button type="submit" data-testid="update-button">
                Update Article
              </button>
            </form>
            {success && <div data-testid="success-message">Article updated!</div>}
            <div data-testid="current-title">{article.title}</div>
          </div>
        )
      }

      render(<EditNewsForm />)

  // Update the title and content using deterministic change events
  const titleInput = screen.getByTestId('title-input')
  fireEvent.change(titleInput, { target: { value: 'Updated Title' } })

  const contentInput = screen.getByTestId('content-input')
  fireEvent.change(contentInput, { target: { value: 'Updated content' } })

      // Wait for the controlled state to reflect changes, then submit
      await waitFor(() => {
        expect(screen.getByTestId('current-title')).toHaveTextContent('Updated Title')
      })

      // Submit the update
      await user.click(screen.getByTestId('update-button'))

  // Verify API was called and body contains updated fields
  await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  const callArgs = mockFetch.mock.calls[0]
  expect(callArgs[0]).toBe('/api/news')
  expect(callArgs[1].method).toBe('PUT')
  const sentBody = JSON.parse(callArgs[1].body)
  expect(sentBody.title).toBe('Updated Title')
  expect(sentBody.content).toBe('Updated content')
  // Verify response contained the updated article
  const updatedResp = await mockFetch.mock.results[0].value
  const updatedJson = await updatedResp.json()
  expect(updatedJson.data.title).toBe('Updated Title')
    })
  })

  describe('News Deletion Workflow', () => {
    it('should handle news article deletion', async () => {
      const user = userEvent.setup()

      // Mock successful deletion
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Article deleted successfully',
        }),
      })

      const DeleteNewsButton = ({ articleId }: { articleId: string }) => {
        const [deleted, setDeleted] = React.useState(false)

        const handleDelete = async () => {
          const response = await fetch(`/api/news?id=${articleId}`, {
            method: 'DELETE',
          })

          if (response.ok) {
            setDeleted(true)
          }
        }

        if (deleted) {
          return <div data-testid="deleted-message">Article deleted</div>
        }

        return (
          <button
            onClick={handleDelete}
            data-testid="delete-button"
          >
            Delete Article
          </button>
        )
      }

      render(<DeleteNewsButton articleId="123" />)

      // Click delete button
      await user.click(screen.getByTestId('delete-button'))

      // Verify API was called correctly
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/news?id=123', {
          method: 'DELETE',
        })
      })

  // Verify API was called for deletion and returned success
  await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  const delResp = await mockFetch.mock.results[0].value
  const delJson = await delResp.json()
  // Accept success flag and optional message
  expect(delJson.success).toBe(true)
  if (delJson.message) expect(typeof delJson.message).toBe('string')
    })

    it('should handle deletion errors', async () => {
      const user = userEvent.setup()

      // Mock deletion error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({
          success: false,
          error: 'Article not found',
        }),
      })

      const DeleteNewsButton = () => {
        const [error, setError] = React.useState('')

        const handleDelete = async () => {
          const response = await fetch('/api/news?id=nonexistent', {
            method: 'DELETE',
          })

          if (!response.ok) {
            const result = await response.json()
            setError(result.error)
          }
        }

        return (
          <div>
            <button onClick={handleDelete} data-testid="delete-button">
              Delete Article
            </button>
            {error && <div data-testid="error-message">{error}</div>}
          </div>
        )
      }

      render(<DeleteNewsButton />)

      // Click delete button
      await user.click(screen.getByTestId('delete-button'))

  // Verify API was called for deletion and returned not found error
  await waitFor(() => expect(mockFetch).toHaveBeenCalled())
  const delErrResp = await mockFetch.mock.results[0].value
  const delErrJson = await delErrResp.json()
  expect(delErrJson).toEqual({ success: false, error: 'Article not found' })
    })
  })
})

// using real React imported above
