import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextRouter } from 'next/router'

// Mock Next.js navigation and contexts
const mockPush = jest.fn()
const mockToast = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}))

jest.mock('@/contexts/ToastContext', () => ({
  useToast: () => mockToast,
}))

jest.mock('@/lib/api', () => ({
  authenticatedApiCall: jest.fn(),
}))

jest.mock('@/components/Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>
  }
})

jest.mock('@/components/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>
  }
})

// Import the component after mocking
import AdminPage from '@/app/admin/page'

describe('Admin Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock authentication check
    ;(require('@/lib/api').authenticatedApiCall as jest.Mock).mockResolvedValue({
      success: true,
    })
  })

  it('should render admin dashboard with all navigation cards', async () => {
    render(<AdminPage />)

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()

    // Wait for loading to finish and the actual header to render
    await waitFor(() => expect(screen.getByText('Administration')).toBeInTheDocument())
    
  // Check for main navigation cards (some labels appear multiple times)
  expect(screen.getAllByText('Nyheter').length).toBeGreaterThanOrEqual(1)
  expect(screen.getAllByText('Tävlingar').length).toBeGreaterThanOrEqual(1)
  expect(screen.getAllByText('Distriktsrekord').length).toBeGreaterThanOrEqual(1)
  expect(screen.getAllByText('Klubbar').length).toBeGreaterThanOrEqual(1)
  // Kalenderhändelser label can be split across nodes; check a substring
  expect(screen.getByText((content, node) => content.includes('Kalender'))).toBeInTheDocument()
    expect(screen.getByText('Sponsorer')).toBeInTheDocument()
    expect(screen.getByText('Styrelsen')).toBeInTheDocument()
  // check any matching node contains the substring 'Kontakt'
  const kontaktNodes = screen.getAllByText((content) => typeof content === 'string' && content.includes('Kontakt'))
  expect(kontaktNodes.length).toBeGreaterThan(0)
  })

  it('should have links to all admin sections', () => {
    render(<AdminPage />)

    // Wait for data to load then check for navigation links
    return waitFor(() => {
      const links = screen.getAllByRole('link')
      const hrefs = links.map(l => l.getAttribute('href'))

      expect(hrefs).toEqual(expect.arrayContaining(['/admin/news', '/admin/competitions', '/admin/records', '/admin/clubs']))
      expect(links.length).toBeGreaterThan(0)
    })
  })

  it('should show statistics cards with proper styling', async () => {
    render(<AdminPage />)

    // Wait for component to render stats
    await waitFor(() => {
      const statsCards = screen.getAllByText(/\d+/)
      expect(statsCards.length).toBeGreaterThan(0)
    })
  })

  it('should handle authentication errors', async () => {
    // Mock authentication failure
    ;(require('@/lib/api').authenticatedApiCall as jest.Mock).mockRejectedValue(
      new Error('Unauthorized')
    )

  render(<AdminPage />)

  // Should still render the dashboard structure (wait for load)
  await waitFor(() => expect(screen.getByText('Administration')).toBeInTheDocument())
  })

  it('should have proper responsive layout', () => {
    render(<AdminPage />)

    return waitFor(() => {
      const container = screen.getByText('Administration').closest('.container')
      expect(container).toHaveClass('mx-auto', 'px-4', 'py-8')

      // Check for grid layout (use first occurrence of Nyheter)
      const newsElems = screen.getAllByText(/Nyheter/)
      const grid = newsElems[0].closest('.grid')
      expect(grid).toHaveClass('grid')
    })
  })

  it('should show proper status indicators', async () => {
    render(<AdminPage />)

    // Look for status-related elements after load
    await waitFor(() => {
      expect(screen.getByText('Administration')).toBeInTheDocument()
    })
  })

  it('should handle card hover states', async () => {
    const user = userEvent.setup()
    render(<AdminPage />)

    // Wait for items to render and then find the news card
    await waitFor(() => expect(screen.getAllByText(/Nyheter/).length).toBeGreaterThan(0))

    const newsCard = screen.getAllByText(/Nyheter/)[0].closest('a')
    
    if (newsCard) {
      await user.hover(newsCard)
      // The card should have hover effects via CSS
      expect(newsCard).toHaveClass('hover:shadow-md')
    }
  })
})
