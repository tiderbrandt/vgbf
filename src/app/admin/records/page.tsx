'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import AdminBackButton from '@/components/AdminBackButton'
import { DistrictRecord } from '@/types'
import { useToast } from '@/contexts/ToastContext'
import Cookies from 'js-cookie'

export default function RecordsAdminPage() {
  const { success, error } = useToast()
  const [records, setRecords] = useState<DistrictRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/records', {
        headers: {
          'Authorization': `Bearer ${Cookies.get('auth-token')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setRecords(data.data)
      } else {
        error('Kunde inte ladda distriktsrekord')
      }
    } catch (err) {
      console.error('Error loading records:', err)
      error('Fel vid laddning av distriktsrekord')
    } finally {
      setLoading(false)
    }
  }, [error])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const handleDelete = async (recordId: string) => {
    if (!confirm('Är du säker på att du vill ta bort detta rekord?')) return
    
    try {
      setDeleting(recordId)
      const response = await fetch('/api/records', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('auth-token')}`
        },
        body: JSON.stringify({ id: recordId })
      })
      
      const data = await response.json()
      if (data.success) {
        setRecords(prev => prev.filter(record => record.id !== recordId))
        success('Rekord borttaget!')
      } else {
        error('Fel vid borttagning: ' + (data.error || 'Ett oväntat fel inträffade.'))
      }
    } catch (err) {
      console.error('Error deleting record:', err)
      error('Ett oväntat fel inträffade vid borttagning av rekordet.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-vgbf-blue">Distriktsrekord</h1>
                <p className="text-gray-600 mt-2">Administrera distriktsrekord</p>
              </div>
              <div className="flex gap-3">
                <AdminBackButton />
                <Link 
                  href="/admin/records/new"
                  className="bg-vgbf-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lägg till rekord
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-vgbf-blue"></div>
                <p className="mt-2 text-gray-600">Laddar distriktsrekord...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 bg-gray-50 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">Distriktsrekord</h2>
                </div>
                
                {records.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kategori
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Klass
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Namn
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Resultat
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Datum
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Åtgärder
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {records.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.class}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {record.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-vgbf-blue">
                              {record.score}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(record.date).toLocaleDateString('sv-SE')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Link
                                href={`/admin/records/${record.id}/edit`}
                                className="text-vgbf-blue hover:text-blue-900 mr-3"
                              >
                                Redigera
                              </Link>
                              <button
                                onClick={() => handleDelete(record.id)}
                                disabled={deleting === record.id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                {deleting === record.id ? 'Tar bort...' : 'Ta bort'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <p className="mb-4">Inga distriktsrekord hittades.</p>
                    <Link 
                      href="/admin/records/new"
                      className="bg-vgbf-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Lägg till första rekordet
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </ProtectedRoute>
  )
}
