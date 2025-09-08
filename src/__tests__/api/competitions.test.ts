/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from '@/app/api/competitions/route'
import { 
  createMockCompetition, 
  createMockRequest, 
  createAuthHeaders,
  setupTest,
  teardownTest 
} from '@/test-utils/test-helpers'

// Mock the storage functions
jest.mock('@/lib/competitions-storage-postgres')
jest.mock('@/lib/auth')

const mockCompetitionsStorage = {
  getAllCompetitions: require('@/lib/competitions-storage-postgres').getAllCompetitions,
  getUpcomingCompetitions: require('@/lib/competitions-storage-postgres').getUpcomingCompetitions,
  getPastCompetitions: require('@/lib/competitions-storage-postgres').getPastCompetitions,
  addCompetition: require('@/lib/competitions-storage-postgres').addCompetition,
  updateCompetition: require('@/lib/competitions-storage-postgres').updateCompetition,
  deleteCompetition: require('@/lib/competitions-storage-postgres').deleteCompetition,
}

const mockAuth = {
  verifyAdminAuth: require('@/lib/auth').verifyAdminAuth,
  createUnauthorizedResponse: require('@/lib/auth').createUnauthorizedResponse,
}

describe('/api/competitions API Routes', () => {
  beforeEach(() => {
    setupTest()
    jest.clearAllMocks()
  })

  afterEach(() => {
    teardownTest()
  })

  describe('GET /api/competitions', () => {
    const mockCompetitions = [
      createMockCompetition({ id: '1', name: 'Competition 1', status: 'upcoming' }),
      createMockCompetition({ id: '2', name: 'Competition 2', status: 'completed' }),
      createMockCompetition({ id: '3', name: 'Competition 3', category: 'indoor', status: 'upcoming' }),
    ]

    it('should return all competitions by default', async () => {
      mockCompetitionsStorage.getAllCompetitions.mockResolvedValue(mockCompetitions)

      const request = createMockRequest('GET', 'http://localhost:3000/api/competitions')
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        success: true,
        data: mockCompetitions,
        count: mockCompetitions.length,
      })
      expect(mockCompetitionsStorage.getAllCompetitions).toHaveBeenCalledTimes(1)
    })

    it('should return upcoming competitions when type=upcoming', async () => {
      const upcomingCompetitions = [mockCompetitions[0], mockCompetitions[2]]
      mockCompetitionsStorage.getUpcomingCompetitions.mockResolvedValue(upcomingCompetitions)

      const request = createMockRequest('GET', 'http://localhost:3000/api/competitions?type=upcoming')
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        success: true,
        data: upcomingCompetitions,
        count: upcomingCompetitions.length,
      })
      expect(mockCompetitionsStorage.getUpcomingCompetitions).toHaveBeenCalledTimes(1)
    })

    it('should return completed competitions when type=completed', async () => {
      const completedCompetitions = [mockCompetitions[1]]
      mockCompetitionsStorage.getPastCompetitions.mockResolvedValue(completedCompetitions)

      const request = createMockRequest('GET', 'http://localhost:3000/api/competitions?type=completed')
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        success: true,
        data: completedCompetitions,
        count: completedCompetitions.length,
      })
      expect(mockCompetitionsStorage.getPastCompetitions).toHaveBeenCalledTimes(1)
    })

    it('should filter by category when specified', async () => {
      const allCompetitions = mockCompetitions
      const indoorCompetitions = [mockCompetitions[2]]
      mockCompetitionsStorage.getAllCompetitions.mockResolvedValue(allCompetitions)

      const request = createMockRequest('GET', 'http://localhost:3000/api/competitions?category=indoor')
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.data).toEqual(indoorCompetitions)
      expect(responseData.count).toBe(1)
    })

    it('should not filter when category is "all"', async () => {
      mockCompetitionsStorage.getAllCompetitions.mockResolvedValue(mockCompetitions)

      const request = createMockRequest('GET', 'http://localhost:3000/api/competitions?category=all')
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.data).toEqual(mockCompetitions)
      expect(responseData.count).toBe(mockCompetitions.length)
    })

    it('should handle non-array response from storage', async () => {
      mockCompetitionsStorage.getAllCompetitions.mockResolvedValue(null)

      const request = createMockRequest('GET', 'http://localhost:3000/api/competitions')
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.data).toEqual([])
      expect(responseData.count).toBe(0)
    })

    it('should handle storage errors gracefully', async () => {
      mockCompetitionsStorage.getAllCompetitions.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest('GET', 'http://localhost:3000/api/competitions')
      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      // route returns an empty data array in the error case
      expect(responseData).toEqual({
        success: false,
        error: 'Failed to fetch competitions',
        data: [],
      })
    })
  })

  describe('POST /api/competitions', () => {
    // Only include fields the route constructs and forwards to storage
    const newCompetitionData = {
      title: 'New Competition',
      date: '2024-12-01',
      location: 'New Location',
      description: 'New competition description',
      category: 'outdoor',
      organizer: 'New Organizer',
    }

    it('should create a new competition when authenticated', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      const createdCompetition = createMockCompetition({ ...newCompetitionData, id: '123' })
      mockCompetitionsStorage.addCompetition.mockResolvedValue(createdCompetition)

      const request = createMockRequest(
        'POST',
        'http://localhost:3000/api/competitions',
        newCompetitionData,
        createAuthHeaders()
      )

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(201)
      expect(responseData).toEqual({
        success: true,
        data: createdCompetition,
      })
      // storage is called with the competitionData shape produced by the route
      expect(mockCompetitionsStorage.addCompetition).toHaveBeenCalledWith(
        expect.objectContaining({
          title: newCompetitionData.title,
          date: newCompetitionData.date,
          location: newCompetitionData.location,
          description: newCompetitionData.description,
          category: newCompetitionData.category,
          organizer: newCompetitionData.organizer,
        })
      )
    })

    it('should return 401 when not authenticated', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(false)
      mockAuth.createUnauthorizedResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )

      const request = createMockRequest('POST', 'http://localhost:3000/api/competitions', newCompetitionData)
      const response = await POST(request)

      expect(response.status).toBe(401)
      expect(mockCompetitionsStorage.addCompetition).not.toHaveBeenCalled()
    })

    it('should accept minimal competition data (route does not validate heavily)', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      const minimalData = { title: 'Minimal Competition' }

      const request = createMockRequest(
        'POST',
        'http://localhost:3000/api/competitions',
        minimalData,
        createAuthHeaders()
      )

      const response = await POST(request)
      const responseData = await response.json()

      // The current implementation tolerates missing fields and will attempt to create
      expect(response.status).toBe(201)
      expect(responseData.success).toBe(true)
    })

    it('should handle storage errors during creation', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      mockCompetitionsStorage.addCompetition.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest(
        'POST',
        'http://localhost:3000/api/competitions',
        newCompetitionData,
        createAuthHeaders()
      )

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        success: false,
        error: 'Failed to create competition',
      })
    })
  })

  describe('PUT /api/competitions', () => {
    const updateData = {
      id: '123',
      name: 'Updated Competition',
      date: '2024-12-15',
      location: 'Updated Location',
    }

    it('should update an existing competition when authenticated', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      const updatedCompetition = createMockCompetition(updateData)
      mockCompetitionsStorage.updateCompetition.mockResolvedValue(updatedCompetition)

      const request = createMockRequest(
        'PUT',
        'http://localhost:3000/api/competitions',
        updateData,
        createAuthHeaders()
      )

      const response = await PUT(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        success: true,
        data: updatedCompetition,
      })
      expect(mockCompetitionsStorage.updateCompetition).toHaveBeenCalledWith('123', updateData)
    })

    it('should return 401 when not authenticated', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(false)
      mockAuth.createUnauthorizedResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )

      const request = createMockRequest('PUT', 'http://localhost:3000/api/competitions', updateData)
      const response = await PUT(request)

      expect(response.status).toBe(401)
      expect(mockCompetitionsStorage.updateCompetition).not.toHaveBeenCalled()
    })

    it('should return 400 when id is missing', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      const dataWithoutId = { name: 'Updated Competition' }

      const request = createMockRequest(
        'PUT',
        'http://localhost:3000/api/competitions',
        dataWithoutId,
        createAuthHeaders()
      )

      const response = await PUT(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData).toEqual({
        success: false,
        error: 'Competition ID is required for update',
      })
    })

    it('should return 404 when competition not found', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      mockCompetitionsStorage.updateCompetition.mockResolvedValue(null)

      const request = createMockRequest(
        'PUT',
        'http://localhost:3000/api/competitions',
        updateData,
        createAuthHeaders()
      )

      const response = await PUT(request)
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData).toEqual({
        success: false,
        error: 'Competition not found',
      })
    })
  })

  describe('DELETE /api/competitions', () => {
    it('should delete a competition when authenticated and id provided', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      mockCompetitionsStorage.deleteCompetition.mockResolvedValue(true)

      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/competitions?id=123',
        null,
        createAuthHeaders()
      )

      const response = await DELETE(request)
      const responseData = await response.json()

  expect(response.status).toBe(200)
  expect(responseData).toEqual(expect.objectContaining({ success: true }))
      expect(mockCompetitionsStorage.deleteCompetition).toHaveBeenCalledWith('123')
    })

    it('should return 401 when not authenticated', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(false)
      mockAuth.createUnauthorizedResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )

      const request = createMockRequest('DELETE', 'http://localhost:3000/api/competitions?id=123')
      const response = await DELETE(request)

      expect(response.status).toBe(401)
      expect(mockCompetitionsStorage.deleteCompetition).not.toHaveBeenCalled()
    })

    it('should return 400 when id is missing', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)

      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/competitions',
        null,
        createAuthHeaders()
      )

      const response = await DELETE(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData).toEqual({
        success: false,
        error: 'Competition ID is required for deletion',
      })
    })

    it('should return 404 when competition not found', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      mockCompetitionsStorage.deleteCompetition.mockResolvedValue(false)

      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/competitions?id=999',
        null,
        createAuthHeaders()
      )

      const response = await DELETE(request)
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData).toEqual({
        success: false,
        error: 'Competition not found',
      })
    })

    it('should handle storage errors during deletion', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      mockCompetitionsStorage.deleteCompetition.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/competitions?id=123',
        null,
        createAuthHeaders()
      )

      const response = await DELETE(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        success: false,
        error: 'Failed to delete competition',
      })
    })
  })
})
