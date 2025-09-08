// Mock data factories
export const createMockNewsArticle = (overrides = {}) => ({
  id: '1',
  title: 'Test Article',
  excerpt: 'This is a test article excerpt',
  content: 'This is the full content of the test article',
  date: '2024-01-01',
  author: 'Test Author',
  slug: 'test-article',
  featured: false,
  tags: ['test'],
  imageUrl: '/test-image.jpg',
  imageAlt: 'Test image',
  ...overrides,
})

export const createMockCompetition = (overrides = {}) => ({
  id: '1',
  name: 'Test Competition',
  date: '2024-12-01',
  endDate: '2024-12-01',
  location: 'Test Location',
  description: 'Test competition description',
  category: 'outdoor',
  organizer: 'Test Organizer',
  status: 'upcoming',
  registrationOpen: true,
  registrationDeadline: '2024-11-25',
  contactEmail: 'test@example.com',
  maxParticipants: 100,
  entryFee: 200,
  ...overrides,
})

export const createMockRecord = (overrides = {}) => ({
  id: '1',
  category: 'Recurve',
  class: 'Senior Men',
  name: 'Test Archer',
  club: 'Test Club',
  score: '350',
  date: '2024-01-01',
  competition: 'Test Competition',
  organizer: 'Test Organizer',
  location: 'Test Location',
  ...overrides,
})

export const createMockClub = (overrides = {}) => ({
  id: '1',
  name: 'Test Club',
  city: 'Test City',
  county: 'Test County',
  website: 'https://testclub.se',
  email: 'test@testclub.se',
  phone: '123-456-7890',
  description: 'Test club description',
  facilities: ['Outdoor range'],
  contactPerson: 'Test Contact',
  foundedYear: 2000,
  memberCount: 50,
  coordinates: { lat: 57.7089, lng: 11.9746 },
  ...overrides,
})

// Authentication helpers
export const createAuthHeaders = () => ({
  'Authorization': 'Bearer valid-token',
  'Content-Type': 'application/json',
})

export const createMockRequest = (
  method: string,
  url: string,
  body?: any,
  headers?: Record<string, string>
) => {
  const requestInit: any = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  }

  if (body && (method === 'POST' || method === 'PUT')) {
    requestInit.body = JSON.stringify(body)
  }

  // Return a lightweight mock request compatible with tests
  return {
    method,
    url,
    json: async () => body,
    headers: new Map(Object.entries(requestInit.headers || {})),
  }
}

// Mock storage functions
export const mockStorageFunctions = () => {
  // Mock all storage functions to return resolved promises
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
}

// Mock auth functions
export const mockAuthFunctions = () => {
  jest.mock('@/lib/auth', () => ({
    verifyAdminToken: jest.fn(),
    verifyAdminAuth: jest.fn(),
    createUnauthorizedResponse: jest.fn(() => 
      new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    ),
  }))
}

// Response assertion helpers
export const expectSuccessResponse = (response: any, expectedData?: any) => {
  expect(response.status).toBe(200)
  if (expectedData) {
    expect(response.json).toEqual(expect.objectContaining({
      success: true,
      data: expectedData,
    }))
  }
}

export const expectErrorResponse = (response: any, expectedStatus: number, expectedError?: string) => {
  expect(response.status).toBe(expectedStatus)
  if (expectedError) {
    expect(response.json).toEqual(expect.objectContaining({
      success: false,
      error: expectedError,
    }))
  }
}

// Setup and teardown helpers
export const setupTest = () => {
  mockStorageFunctions()
  mockAuthFunctions()
  
  // Reset all mocks before each test
  jest.clearAllMocks()
  
  // Mock fetch responses
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
  mockFetch.mockClear()
}

export const teardownTest = () => {
  jest.restoreAllMocks()
}
