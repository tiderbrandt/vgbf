/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { GET, POST, DELETE } from '@/app/api/records/route'
import { 
  createMockRecord, 
  createMockRequest, 
  createAuthHeaders,
  setupTest,
  teardownTest 
} from '@/test-utils/test-helpers'

// Mock the storage functions
jest.mock('@/lib/records-storage-postgres')
jest.mock('@/lib/auth')

const mockRecordsStorage = {
  getAllRecords: require('@/lib/records-storage-postgres').getAllRecords,
  addRecord: require('@/lib/records-storage-postgres').addRecord,
  deleteRecord: require('@/lib/records-storage-postgres').deleteRecord,
}

const mockAuth = {
  verifyAdminAuth: require('@/lib/auth').verifyAdminAuth,
  createUnauthorizedResponse: require('@/lib/auth').createUnauthorizedResponse,
}

describe('/api/records API Routes', () => {
  beforeEach(() => {
    setupTest()
    jest.clearAllMocks()
  })

  afterEach(() => {
    teardownTest()
  })

  describe('GET /api/records', () => {
    const mockRecords = [
      createMockRecord({ id: '1', name: 'Archer 1', category: 'Recurve' }),
      createMockRecord({ id: '2', name: 'Archer 2', category: 'Compound' }),
      createMockRecord({ id: '3', name: 'Archer 3', category: 'Barebow' }),
    ]

    it('should return all district records', async () => {
      mockRecordsStorage.getAllRecords.mockResolvedValue(mockRecords)

      const request = createMockRequest('GET', 'http://localhost:3000/api/records')
      const response = await GET()
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        success: true,
        data: mockRecords,
      })
      expect(mockRecordsStorage.getAllRecords).toHaveBeenCalledTimes(1)
    })

    it('should handle storage errors gracefully', async () => {
      mockRecordsStorage.getAllRecords.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest('GET', 'http://localhost:3000/api/records')
      const response = await GET()
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        success: false,
        error: 'Failed to fetch records',
      })
    })
  })

  describe('POST /api/records', () => {
    const newRecordData = {
      category: 'Recurve',
      class: 'Senior Men',
      name: 'Test Archer',
      club: 'Test Club',
      score: '350',
      date: '2024-01-01',
      competition: 'Test Competition',
      organizer: 'Test Organizer',
      location: 'Test Location',
    }

    it('should create a new record when authenticated', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      const createdRecord = createMockRecord({ ...newRecordData, id: '123' })
      mockRecordsStorage.addRecord.mockResolvedValue(createdRecord)

      const request = createMockRequest(
        'POST',
        'http://localhost:3000/api/records',
        newRecordData,
        createAuthHeaders()
      )

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        success: true,
        data: createdRecord,
      })
      expect(mockRecordsStorage.addRecord).toHaveBeenCalledWith(newRecordData)
    })

    it('should return 401 when not authenticated', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(false)
      mockAuth.createUnauthorizedResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )

      const request = createMockRequest('POST', 'http://localhost:3000/api/records', newRecordData)
      const response = await POST(request)

      expect(response.status).toBe(401)
      expect(mockRecordsStorage.addRecord).not.toHaveBeenCalled()
    })

    it('should validate required fields', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      
      const requiredFields = ['category', 'class', 'name', 'club', 'score', 'date', 'competition', 'organizer']
      
      for (const field of requiredFields) {
        const incompleteData = { ...newRecordData } as any
        delete incompleteData[field]

        const request = createMockRequest(
          'POST',
          'http://localhost:3000/api/records',
          incompleteData,
          createAuthHeaders()
        )

        const response = await POST(request)
        const responseData = await response.json()

        expect(response.status).toBe(400)
        expect(responseData).toEqual({
          success: false,
          error: `Field ${field} is required`,
        })

        // Reset mock for next iteration
        jest.clearAllMocks()
        mockAuth.verifyAdminAuth.mockReturnValue(true)
      }
    })

    it('should handle storage errors during creation', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      mockRecordsStorage.addRecord.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest(
        'POST',
        'http://localhost:3000/api/records',
        newRecordData,
        createAuthHeaders()
      )

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        success: false,
        error: 'Failed to add record',
      })
    })
  })

  describe('DELETE /api/records', () => {
    it('should delete a record when authenticated and id provided', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      mockRecordsStorage.deleteRecord.mockResolvedValue(true)

      // route expects a JSON body with { id }
      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/records',
        { id: '123' },
        createAuthHeaders()
      )

      const response = await DELETE(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      // route currently returns only success: true on delete
      expect(responseData).toEqual({
        success: true,
      })
      expect(mockRecordsStorage.deleteRecord).toHaveBeenCalledWith('123')
    })

    it('should return 401 when not authenticated', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(false)
      mockAuth.createUnauthorizedResponse.mockReturnValue(
        new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
      )

  const request = createMockRequest('DELETE', 'http://localhost:3000/api/records', { id: '123' })
      const response = await DELETE(request)

      expect(response.status).toBe(401)
      expect(mockRecordsStorage.deleteRecord).not.toHaveBeenCalled()
    })

    it('should return 400 when id is missing', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)

      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/records',
        {},
        createAuthHeaders()
      )

      const response = await DELETE(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      // route returns a shorter message
      expect(responseData).toEqual({
        success: false,
        error: 'Record ID is required',
      })
    })

    it('should return 404 when record not found', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      mockRecordsStorage.deleteRecord.mockResolvedValue(false)

      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/records',
        { id: '999' },
        createAuthHeaders()
      )

      const response = await DELETE(request)
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData).toEqual({
        success: false,
        error: 'Record not found',
      })
    })

    it('should handle storage errors during deletion', async () => {
      mockAuth.verifyAdminAuth.mockReturnValue(true)
      mockRecordsStorage.deleteRecord.mockRejectedValue(new Error('Database error'))

      const request = createMockRequest(
        'DELETE',
        'http://localhost:3000/api/records',
        { id: '123' },
        createAuthHeaders()
      )

      const response = await DELETE(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        success: false,
        error: 'Failed to delete record',
      })
    })
  })
})
