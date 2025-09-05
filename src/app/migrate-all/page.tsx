'use client'

import { useState } from 'react'
import Header from '@/components/Header'

export default function MigrateAllPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)

  const migrateAll = async () => {
    setStatus('loading')
    try {
      const response = await fetch('/api/migrate-all', {
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
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-vgbf-blue mb-6">
            Migrate All Data to Blob Storage
          </h1>
          
          <p className="text-gray-600 mb-6">
            This tool will migrate all data from local files to blob storage to ensure production compatibility.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">What will be migrated:</h3>
              <ul className="text-blue-700 space-y-1">
                <li>• Competitions (Tävlingar)</li>
                <li>• Records (Distriktsrekord)</li>
                <li>• Calendar (Kalender)</li>
                <li>• Sponsors (Sponsorer)</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Benefits:</h3>
              <ul className="text-green-700 space-y-1">
                <li>• Production compatibility</li>
                <li>• Better performance</li>
                <li>• Automatic backups</li>
                <li>• Consistent data access</li>
              </ul>
            </div>
          </div>
          
          <button
            onClick={migrateAll}
            disabled={status === 'loading'}
            className="w-full bg-vgbf-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Migrating All Data...' : 'Start Migration'}
          </button>
          
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              status === 'success' ? 'bg-green-100 border border-green-300' :
              'bg-red-100 border border-red-300'
            }`}>
              <h3 className="font-semibold mb-2">
                {status === 'success' ? 'Migration Results:' : 'Error:'}
              </h3>
              
              {status === 'success' && result.details && (
                <div className="space-y-2 mb-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-white p-2 rounded">
                      <div className="font-medium">Competitions</div>
                      <div className="text-green-600">{result.details.competitions.migrated} migrated</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="font-medium">Records</div>
                      <div className="text-green-600">{result.details.records.migrated} migrated</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="font-medium">Calendar</div>
                      <div className="text-green-600">{result.details.calendar.migrated} migrated</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="font-medium">Sponsors</div>
                      <div className="text-green-600">{result.details.sponsors.migrated} migrated</div>
                    </div>
                  </div>
                </div>
              )}
              
              <pre className="text-sm overflow-auto bg-white p-2 rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          {status === 'success' && (
            <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
              <p className="text-blue-800">
                ✅ Migration completed! All data systems now use blob storage and will work properly in production.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
