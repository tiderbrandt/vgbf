export function createMockClub(overrides: any = {}) {
  return {
    id: overrides?.id || '1',
    name: overrides?.name || 'Test Club',
    description: overrides?.description || 'Description',
    location: overrides?.location || 'Test Location',
    email: overrides?.email || 'test@example.com',
    city: overrides?.city || 'Test City',
    activities: overrides?.activities || [],
    welcomesNewMembers: overrides?.welcomesNewMembers ?? true,
    ...overrides,
  }
}

export function createMockCompetition(overrides: any = {}) {
  return {
    id: overrides?.id || '1',
    title: overrides?.title || overrides?.name || 'Test Competition',
    name: overrides?.name || overrides?.title || 'Test Competition',
    description: overrides?.description || 'Comp description',
    date: overrides?.date || '2024-01-01',
    organizer: overrides?.organizer || 'Organizer',
    location: overrides?.location || 'Venue',
    category: overrides?.category || 'outdoor',
    status: overrides?.status || 'upcoming',
    ...overrides,
  }
}

export function createMockRecord(overrides: any = {}) {
  return {
    id: overrides?.id || '1',
    athlete: overrides?.athlete || 'Test Athlete',
    event: overrides?.event || '100m',
    result: overrides?.result || '10.00',
    date: overrides?.date || '2023-01-01',
    ...overrides,
  }
}

export function createMockNewsArticle(overrides: any = {}) {
  return {
    id: overrides?.id || '1',
    title: overrides?.title || 'Test News',
    content: overrides?.content || 'Content',
    published: overrides?.published ?? true,
    ...overrides,
  }
}

export function createAuthHeaders() {
  return { Authorization: 'Bearer test-token' }
}

export function createMockRequest(method: string, url: string, body?: any, headers?: any) {
  return {
    method,
    url,
    json: async () => body,
    headers: new Map(Object.entries(headers || {})),
  } as any
}

export function setupTest() {
  // noop for now
}

export function teardownTest() {
  // noop for now
}
