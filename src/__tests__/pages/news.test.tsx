import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import NewsPage from '@/app/nyheter/page'

// Mock all the components that NewsPage uses
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

jest.mock('@/components/NewsClient', () => {
  return function MockNewsClient() {
    return <div data-testid="news-client">News Client</div>
  }
})

describe('News Page', () => {
  it('should render all main sections', async () => {
    // Since NewsPage is an async component, we need to resolve it
    const ResolvedNewsPage = await NewsPage()
    render(ResolvedNewsPage)

    // Check that all major components are rendered
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
    expect(screen.getByTestId('news-client')).toBeInTheDocument()
  })

  it('should have correct page title and description', async () => {
    const ResolvedNewsPage = await NewsPage()
    render(ResolvedNewsPage)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Nyheter')
    expect(screen.getByText(/Håll dig uppdaterad med de senaste nyheterna/)).toBeInTheDocument()
  })

  it('should have correct main structure', async () => {
    const ResolvedNewsPage = await NewsPage()
    render(ResolvedNewsPage)

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveClass('min-h-screen', 'bg-white')
  })

  it('should have proper container structure', async () => {
    const ResolvedNewsPage = await NewsPage()
    render(ResolvedNewsPage)

    // Check for container with proper classes
    const container = screen.getByText('Nyheter').closest('.container')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('mx-auto', 'px-4', 'py-16')
  })

  it('should have centered text section', async () => {
    const ResolvedNewsPage = await NewsPage()
    render(ResolvedNewsPage)

    const textSection = screen.getByText('Nyheter').closest('.text-center')
    expect(textSection).toBeInTheDocument()
    expect(textSection).toHaveClass('mb-12')
  })

  it('should render components in correct order', async () => {
    const ResolvedNewsPage = await NewsPage()
    render(ResolvedNewsPage)

    const main = screen.getByRole('main')
    const children = Array.from(main.children)

    expect(children[0]).toHaveAttribute('data-testid', 'header')
    expect(children[2]).toHaveAttribute('data-testid', 'footer')
  })
})
