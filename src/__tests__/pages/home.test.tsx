import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Mock all the components that Home uses
jest.mock('@/components/Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>
  }
})

jest.mock('@/components/Hero', () => {
  return function MockHero() {
    return <section data-testid="hero">Hero</section>
  }
})

jest.mock('@/components/SimpleNewsSection', () => {
  return function MockSimpleNewsSection() {
    return <section data-testid="news-section">News Section</section>
  }
})

jest.mock('@/components/CompetitionsSection', () => {
  return function MockCompetitionsSection() {
    return <section data-testid="competitions-section">Competitions Section</section>
  }
})

jest.mock('@/components/RecordsHighlight', () => {
  return function MockRecordsHighlight() {
    return <section data-testid="records-highlight">Records Highlight</section>
  }
})

jest.mock('@/components/Footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>
  }
})

describe('Home Page', () => {
  it('should render all main sections', () => {
    render(<Home />)

    // Check that all major components are rendered
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('hero')).toBeInTheDocument()
    expect(screen.getByTestId('news-section')).toBeInTheDocument()
    expect(screen.getByTestId('competitions-section')).toBeInTheDocument()
    expect(screen.getByTestId('records-highlight')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('should have correct main structure', () => {
    render(<Home />)

    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
    expect(main).toHaveClass('min-h-screen', 'bg-white')
  })

  it('should render components in correct order', () => {
    render(<Home />)

    const main = screen.getByRole('main')
    const children = Array.from(main.children)

    expect(children[0]).toHaveAttribute('data-testid', 'header')
    expect(children[1]).toHaveAttribute('data-testid', 'hero')
    expect(children[2]).toHaveAttribute('data-testid', 'news-section')
    expect(children[3]).toHaveAttribute('data-testid', 'competitions-section')
    expect(children[4]).toHaveAttribute('data-testid', 'records-highlight')
    expect(children[5]).toHaveAttribute('data-testid', 'footer')
  })
})
