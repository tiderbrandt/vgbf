'use client'

import { useState } from 'react'
import Header from '@/components/Header'

export default function ForceClubsPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)

  const forceReset = async () => {
    setStatus('loading')
    try {
      const response = await fetch('/api/force-clubs', {
        method: 'POST',
      })
      const data = await response.json()
      setResult(data)
      setStatus(data.success ? 'success' : 'error')
    } catch (error) {
      setResult({ error: 'Network error' })
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-vgbf-blue mb-6">
            Force Reset Clubs
          </h1>
          
          <p className="text-gray-600 mb-6">
            This tool will force override the blob storage with all clubs to fix the &quot;only 1 club showing&quot; issue.
          </p>
          
          <button
            onClick={forceReset}
            disabled={status === 'loading'}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Force Resetting...' : 'Force Reset Blob Storage'}
          </button>
          
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              status === 'success' ? 'bg-green-100 border border-green-300' :
              'bg-red-100 border border-red-300'
            }`}>
              <h3 className="font-semibold mb-2">
                {status === 'success' ? 'Force Reset Result:' : 'Error:'}
              </h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          {status === 'success' && (
            <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
              <p className="text-blue-800">
                ✅ Force reset completed! Now check: <a href="/admin/clubs" className="underline">clubs admin page</a> and <a href="/api/clubs" className="underline">clubs API</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
