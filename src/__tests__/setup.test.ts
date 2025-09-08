/**
 * Simple test to validate Jest setup
 */

describe('Jest Setup Validation', () => {
  it('should be able to run basic tests', () => {
    expect(1 + 1).toBe(2)
  })

  it('should be able to import test utilities', () => {
    // Try importing our test helper using JavaScript file
  const { createMockNewsArticle } = require('../test-utils/test-helpers')
    expect(typeof createMockNewsArticle).toBe('function')
  })
})
