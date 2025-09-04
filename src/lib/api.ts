import Cookies from 'js-cookie'

interface ApiOptions extends RequestInit {
  requireAuth?: boolean
}

export async function apiCall(url: string, options: ApiOptions = {}) {
  const { requireAuth = false, ...fetchOptions } = options
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (requireAuth) {
    const token = Cookies.get('auth-token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  return response
}

// Convenience methods
export const authenticatedApiCall = (url: string, options: Omit<ApiOptions, 'requireAuth'> = {}) => 
  apiCall(url, { ...options, requireAuth: true })

export const get = (url: string, requireAuth = false) => 
  apiCall(url, { method: 'GET', requireAuth })

export const post = (url: string, data: any, requireAuth = false) => 
  apiCall(url, { 
    method: 'POST', 
    body: JSON.stringify(data),
    requireAuth 
  })

export const put = (url: string, data: any, requireAuth = false) => 
  apiCall(url, { 
    method: 'PUT', 
    body: JSON.stringify(data),
    requireAuth 
  })

export const del = (url: string, requireAuth = false) => 
  apiCall(url, { method: 'DELETE', requireAuth })
