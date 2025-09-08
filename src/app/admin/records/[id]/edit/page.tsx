'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFormState } from '@/hooks/useFormState'

interface DistrictRecord {
  id: string
  category: string
  class: string
  name: string
  club: string
  score: string
  date: string
  competition: string
  competitionUrl?: string
  organizer: string
  notes?: string
}

interface EditRecordPageProps {
  params: {
    id: string
  }
}

const categories = [
  'Inomhus SBF 18m/12m 15 pilar',
  'Inomhus SBF 18m/12m 30 pilar',
  'Utomhus SBF 70m/60m/50m/40m/30m 72/15 pilar',
  'Utomhus SBF 900 rond'
]

const classes = [
  'Damer Compound', 'Damer Recurve', 'Damer Barebow', 'Damer 50+ Recurve',
  'Herrar Compound', 'Herrar Recurve', 'Herrar Barebow', 'Herrar 50+ Recurve',
  'U18 Damer Recurve', 'U18 Herrar Recurve', 'U21 Damer Recurve', 'U21 Herrar Recurve',
  'U18 Damer Barebow', 'Lag Mixed Recurve'
]

export default function EditRecordPage({ params }: EditRecordPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { formData, updateFields, errors, validate, reset } = useFormState<DistrictRecord>({
    id: '',
    category: '',
    class: '',
    name: '',
    club: '',
    score: '',
    date: '',
    competition: '',
    competitionUrl: '',
    organizer: '',
    notes: ''
  })

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        // Get JWT token
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin123' })
        })
        const { token } = await loginResponse.json()

        // Fetch record
        const response = await fetch(`/api/records/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch record')
        }
        
        const { data: record } = await response.json()
        
        // Update form with fetched data
        updateFields({
          id: record.id,
          category: record.category || '',
          class: record.class || '',
          name: record.name || '',
          club: record.club || '',
          score: record.score || '',
          date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
          competition: record.competition || '',
          competitionUrl: record.competitionUrl || '',
          organizer: record.organizer || '',
          notes: record.notes || ''
        })
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load record')
      } finally {
        setLoading(false)
      }
    }

    fetchRecord()
  }, [params.id, updateFields])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Get JWT token
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
      })
      const { token } = await loginResponse.json()

      // Update record
      const response = await fetch(`/api/records/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update record')
      }

      router.push('/admin/records')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update record')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">Loading record...</div>
        </div>
      </div>
    )
  }

  if (error && !formData.id) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Redigera Distriktsrekord
          </h1>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateFields({ category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Välj kategori</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Klass *
                </label>
                <select
                  value={formData.class}
                  onChange={(e) => updateFields({ class: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Välj klass</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Namn *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFields({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Klubb
                </label>
                <input
                  type="text"
                  value={formData.club}
                  onChange={(e) => updateFields({ club: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resultat *
                </label>
                <input
                  type="text"
                  value={formData.score}
                  onChange={(e) => updateFields({ score: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="t.ex. 598/600 eller 723"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Datum *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateFields({ date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tävling *
                </label>
                <input
                  type="text"
                  value={formData.competition}
                  onChange={(e) => updateFields({ competition: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arrangör *
                </label>
                <input
                  type="text"
                  value={formData.organizer}
                  onChange={(e) => updateFields({ organizer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Länk till tävling
              </label>
              <input
                type="url"
                value={formData.competitionUrl}
                onChange={(e) => updateFields({ competitionUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://resultat.bagskytte.se/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anteckningar
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateFields({ notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Valfria anteckningar om rekordet..."
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Sparar...' : 'Spara ändringar'}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/admin/records')}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
              >
                Avbryt
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}