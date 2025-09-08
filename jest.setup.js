import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter() {
        return {
            route: '/',
            pathname: '/',
            query: {},
            asPath: '/',
            push: jest.fn(),
            pop: jest.fn(),
            reload: jest.fn(),
            back: jest.fn(),
            prefetch: jest.fn(),
            beforePopState: jest.fn(),
            events: {
                on: jest.fn(),
                off: jest.fn(),
                emit: jest.fn(),
            },
        }
    },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            refresh: jest.fn(),
        }
    },
    useSearchParams() {
        return new URLSearchParams()
    },
    usePathname() {
        return '/'
    },
}))

// Mock uuid module
jest.mock('uuid', () => ({
    v4: jest.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
}))

// Mock fetch globally with sensible defaults for tests
global.fetch = jest.fn(async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url || ''

    // Default empty collections
    const emptyList = []
    const emptyBoard = {}

    if (url.includes('/api/news')) {
        return {
            ok: true,
            json: async () => ({ success: true, data: emptyList }),
        }
    }

    if (url.includes('/api/competitions')) {
        return {
            ok: true,
            json: async () => ({ success: true, data: emptyList }),
        }
    }

    if (url.includes('/api/clubs')) {
        return {
            ok: true,
            json: async () => ({ success: true, data: emptyList }),
        }
    }

    if (url.includes('/api/sponsors')) {
        return {
            ok: true,
            json: async () => ({ success: true, data: emptyList }),
        }
    }

    if (url.includes('/api/board')) {
        return {
            ok: true,
            json: async () => ({ success: true, data: emptyBoard }),
        }
    }

    // Fallback generic response
    return {
        ok: true,
        json: async () => ({ success: true, data: emptyList }),
    }
})

// Mock storage modules to prevent real DB initialization during imports
jest.mock('@/lib/news-storage-postgres', () => ({
    getAllNews: jest.fn(),
    getFeaturedNews: jest.fn(),
    getRecentNews: jest.fn(),
    addNews: jest.fn(),
    updateNews: jest.fn(),
    deleteNews: jest.fn(),
}))

jest.mock('@/lib/competitions-storage-postgres', () => ({
    getAllCompetitions: jest.fn(),
    getUpcomingCompetitions: jest.fn(),
    getPastCompetitions: jest.fn(),
    addCompetition: jest.fn(),
    updateCompetition: jest.fn(),
    deleteCompetition: jest.fn(),
}))

jest.mock('@/lib/records-storage-postgres', () => ({
    getAllRecords: jest.fn(),
    addRecord: jest.fn(),
    deleteRecord: jest.fn(),
}))

jest.mock('@/lib/clubs-storage-postgres', () => ({
    getAllClubs: jest.fn(),
    getClubById: jest.fn(),
    addClub: jest.fn(),
    updateClub: jest.fn(),
    deleteClub: jest.fn(),
}))

jest.mock('@/lib/sponsors-storage-postgres', () => ({
    getAllSponsors: jest.fn(),
}))

jest.mock('@/lib/board-storage-postgres', () => ({
    getBoardMembers: jest.fn(),
}))

// Mock auth module
jest.mock('@/lib/auth', () => ({
    verifyAdminAuth: jest.fn(() => true),
    verifyAdminToken: jest.fn(() => true),
    createUnauthorizedResponse: jest.fn(() => ({ status: 401, json: async () => ({ error: 'Unauthorized' }) })),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
process.env.JWT_SECRET = 'test-secret'
process.env.ADMIN_USERNAME = 'admin'
process.env.ADMIN_PASSWORD = 'admin123'
