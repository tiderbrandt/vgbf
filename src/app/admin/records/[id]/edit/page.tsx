'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import { useToast } from '@/contexts/ToastContext'
import { useFormState } from '@/hooks/useFormState'
import { DistrictRecord } from '@/types'
import Cookies from 'js-cookie'

export default function EditRecordPage() {
  const router = useRouter()
  const params = useParams()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [record, setRecord] = useState<DistrictRecord | null>(null)
  
  // Initialize form state with our custom hook
  const { formData, updateField, updateFields } = useFormState({
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

  const categories = [
    'Utomhus SBF 70m/60m/50m/40m/30m 72/15 pilar',
    'Inomhus SBF 18m/12m 15 pilar',
    'Inomhus SBF 18m/12m 30 pilar',
    'Utomhus SBF 900 rond'
  ]

  const classes = [
    'Herrar Recurve',
    'Damer Recurve',
    'Herrar Compound',
    'Damer Compound',
    'Herrar Barebow',
    'Damer Barebow',
    'U21 Herrar Recurve',
    'U21 Damer Recurve',
    'U21 Herrar Compound',
    'U21 Damer Compound',
    'U21 Herrar Barebow',
    'U21 Damer Barebow',
    'U18 Herrar Recurve',
    'U18 Damer Recurve',
    'U18 Herrar Compound',
    'U18 Damer Compound',
    'U18 Herrar Barebow',
    'U18 Damer Barebow',
    'U15 Herrar Recurve',
    'U15 Damer Recurve',
    'U15 Herrar Compound',
    'U15 Damer Compound',
    'U15 Herrar Barebow',
    'U15 Damer Barebow'
  ]

  // Fetch the record data when the component mounts
  useEffect(() => {
    const fetchRecord = async () => {
      if (!params.id) return
      
      try {
        setFetchLoading(true)
        const response = await fetch(`/api/records/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${Cookies.get('auth-token')}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch record')
        }
        
        const data = await response.json()
        if (data.success && data.data) {
          const recordData = data.data
          setRecord(recordData)
          
          // Pre-fill the form with existing data
          updateFields({
            category: recordData.category || '',
            class: recordData.class || '',
            name: recordData.name || '',
            club: recordData.club || '',
            score: recordData.score || '',
            date: recordData.date || '',
            competition: recordData.competition || '',
            competitionUrl: recordData.competitionUrl || '',
            organizer: recordData.organizer || '',
            notes: recordData.notes || ''
          })
        } else {
          error('Kunde inte ladda rekord', data.error || 'Rekordet hittades inte.')
          router.push('/admin/records')
        }
      } catch (err) {
        console.error('Error fetching record:', err)
        error('Fel vid laddning', 'Kunde inte ladda rekordet.')
        router.push('/admin/records')
      } finally {
        setFetchLoading(false)
      }
    }

    fetchRecord()
  }, [params.id, error, router, updateFields])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!params.id) return
    
    setLoading(true)

    try {
      const response = await fetch(`/api/records/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('auth-token')}`
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        success('Rekord uppdaterat!', `${formData.name} har uppdaterats i distriktsrekorden.`)
        router.push('/admin/records')
      } else {
        error('Fel vid sparande', data.error || 'Ett oväntat fel inträffade.')
      }
    } catch (err) {
      console.error('Error updating record:', err)
      error('Fel vid sparande', 'Ett oväntat fel inträffade vid uppdatering av rekordet.')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vgbf-blue mx-auto mb-4"></div>
                <p className="text-gray-600">Laddar rekord...</p>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-vgbf-blue">
                Redigera distriktsrekord
              </h1>
              <Link 
                href="/admin/records"
                className="text-vgbf-blue hover:text-blue-700"
              >
                ← Tillbaka
              </Link>
            </div>

            {record && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h2 className="font-semibold text-blue-800">Redigerar:</h2>
                <p className="text-blue-700">{record.name} - {record.category} ({record.class})</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
              <div className="grid gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-vgbf-blue focus:border-vgbf-blue"
                    required
                  >
                    <option value="">Välj kategori</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
                    Klass *
                  </label>
                  <select
                    id="class"
                    value={formData.class}
                    onChange={(e) => updateField('class', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-vgbf-blue focus:border-vgbf-blue"
                    required
                  >
                    <option value="">Välj klass</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Namn *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-vgbf-blue focus:border-vgbf-blue"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="club" className="block text-sm font-medium text-gray-700 mb-2">
                    Klubb *
                  </label>
                  <input
                    type="text"
                    id="club"
                    value={formData.club}
                    onChange={(e) => updateField('club', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-vgbf-blue focus:border-vgbf-blue"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
                    Resultat *
                  </label>
                  <input
                    type="text"
                    id="score"
                    value={formData.score}
                    onChange={(e) => updateField('score', e.target.value)}
                    placeholder="t.ex. 675 eller 589/600"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-vgbf-blue focus:border-vgbf-blue"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Datum *
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => updateField('date', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-vgbf-blue focus:border-vgbf-blue"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="competition" className="block text-sm font-medium text-gray-700 mb-2">
                    Tävling *
                  </label>
                  <input
                    type="text"
                    id="competition"
                    value={formData.competition}
                    onChange={(e) => updateField('competition', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-vgbf-blue focus:border-vgbf-blue"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="competitionUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Länk till tävling
                  </label>
                  <input
                    type="url"
                    id="competitionUrl"
                    value={formData.competitionUrl}
                    onChange={(e) => updateField('competitionUrl', e.target.value)}
                    placeholder="https://resultat.bagskytte.se/..."
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-vgbf-blue focus:border-vgbf-blue"
                  />
                </div>

                <div>
                  <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-2">
                    Arrangör *
                  </label>
                  <input
                    type="text"
                    id="organizer"
                    value={formData.organizer}
                    onChange={(e) => updateField('organizer', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-vgbf-blue focus:border-vgbf-blue"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Anteckningar
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-vgbf-blue focus:border-vgbf-blue"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-vgbf-blue text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sparar...' : 'Uppdatera rekord'}
                </button>
                <Link
                  href="/admin/records"
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Avbryt
                </Link>
              </div>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
