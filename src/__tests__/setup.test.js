// Simple setup test to verify Jest is working
describe('Test Environment Setup', () => {
    test('Jest is configured correctly', () => {
        expect(true).toBe(true)
    })

    test('can import test helpers', () => {
        const { createMockNewsArticle } = require('../test-utils/test-helpers')

        const mockArticle = createMockNewsArticle({ title: 'Setup Test' })

        expect(mockArticle).toEqual(
            expect.objectContaining({
                title: 'Setup Test',
                id: '1',
                published: true,
            })
        )
    })

    test('basic Jest matchers work', () => {
        expect('hello').toMatch(/h/)
        expect(['item1', 'item2']).toContain('item1')
        expect({ name: 'test' }).toHaveProperty('name')
    })
})
