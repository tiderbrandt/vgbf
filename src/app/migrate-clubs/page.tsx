'use client'

import { useState } from 'react'
import Header from '@/components/Header'

export default function MigrationPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)

  const runMigration = async () => {
    setStatus('loading')
    try {
      const response = await fetch('/api/migrate-clubs', {
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
            Clubs Migration Tool
          </h1>
          
          <p className="text-gray-600 mb-6">
            This tool will migrate all clubs from local storage to blob storage to restore the missing clubs.
          </p>
          
          <button
            onClick={runMigration}
            disabled={status === 'loading'}
            className="w-full bg-vgbf-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-vgbf-green transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Migrating...' : 'Migrate Clubs'}
          </button>
          
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              status === 'success' ? 'bg-green-100 border border-green-300' :
              'bg-red-100 border border-red-300'
            }`}>
              <h3 className="font-semibold mb-2">
                {status === 'success' ? 'Migration Result:' : 'Error:'}
              </h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          {status === 'success' && (
            <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
              <p className="text-blue-800">
                ✅ Migration completed! You can now go back to the <a href="/admin/clubs" className="underline">clubs admin page</a> to see all your clubs.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
