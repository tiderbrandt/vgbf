'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DistrictRecord } from '@/types'

export default function RecordsAdminPage() {
  const [records, setRecords] = useState<DistrictRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    try {
      const response = await fetch('/api/records')
      const data = await response.json()
      if (data.success) {
        setRecords(data.data)
      }
    } catch (error) {
      console.error('Error loading records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (recordId: string) => {
    if (!confirm('Är du säker på att du vill ta bort detta rekord?')) return
    
    try {
      const response = await fetch('/api/records', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recordId })
      })
      
      const data = await response.json()
      if (data.success) {
        setRecords(prev => prev.filter(record => record.id !== recordId))
      } else {
        alert('Fel vid borttagning: ' + (data.error || 'Ett oväntat fel inträffade.'))
      }
    } catch (error) {
      console.error('Error deleting record:', error)
      alert('Ett oväntat fel inträffade vid borttagning av rekordet.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Laddar distriktsrekord...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-vgbf-blue">Administrera Distriktsrekord</h1>
          <Link 
            href="/admin/records/new"
            className="bg-vgbf-green text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
          >
            Lägg till nytt rekord
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                          className="text-vgbf-blue hover:text-blue-700 mr-4"
                        >
                          Redigera
                        </Link>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Ta bort
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">Inga distriktsrekord hittades.</p>
              <Link 
                href="/admin/records/new"
                className="bg-vgbf-green text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Lägg till första rekordet
              </Link>
            </div>
          )}
        </div>

        <div className="mt-8">
          <Link 
            href="/admin"
            className="text-vgbf-blue hover:text-blue-700"
          >
            ← Tillbaka till admin
          </Link>
        </div>
      </div>
    </div>
  )
}
