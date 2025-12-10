'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdminBackButton from '@/components/AdminBackButton'
import { Competition } from '@/types'
import ImageUpload from '@/components/admin/ImageUpload'
import { useToast } from '@/contexts/ToastContext'
import { useFormState } from '@/hooks'

type Props = {
  params: { id: string }
}

export default function EditCompetitionPage({ params }: Props) {
  const router = useRouter()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  
  // Initialize form state with our custom hook
  const { formData, updateField, updateFields, isSubmitting: saving, submit } = useFormState({
    title: '',
    description: '',
    date: '',
    registrationDeadline: '',
    organizer: '',
    location: '',
    status: 'upcoming' as Competition['status'],
    category: 'outdoor' as Competition['category'],
    maxParticipants: '',
    registrationUrl: '',
    resultsUrl: '',
    contactEmail: '',
    fee: '',
    equipment: '',
    rules: '',
    imageUrl: '',
    imageAlt: '',
  })
  
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [originalCompetition, setOriginalCompetition] = useState<Competition | null>(null)

  const loadCompetition = useCallback(async () => {
    try {
      const response = await fetch('/api/competitions')
      const data = await response.json()
      if (data.success) {
        const competition = data.data.find((c: Competition) => c.id === params.id)
        if (competition) {
          setOriginalCompetition(competition)
          updateFields({
            title: competition.title,
            description: competition.description,
            date: competition.date,
            registrationDeadline: competition.registrationDeadline || '',
            organizer: competition.organizer,
            location: competition.location,
            status: competition.status,
            category: competition.category,
            maxParticipants: competition.maxParticipants?.toString() || '',
            registrationUrl: competition.registrationUrl || '',
            resultsUrl: competition.resultsUrl || '',
            contactEmail: competition.contactEmail || '',
            fee: competition.fee || '',
            equipment: competition.equipment?.join(', ') || '',
            rules: competition.rules || '',
            imageUrl: competition.imageUrl || '',
            imageAlt: competition.imageAlt || '',
          })

          // Check for saved draft
          if (typeof window !== 'undefined') {
            const savedDraft = localStorage.getItem(`competition-edit-${params.id}`)
            if (savedDraft) {
              try {
                const draft = JSON.parse(savedDraft)
                updateFields(draft)
              } catch (error) {
                console.error('Error loading draft:', error)
              }
            }
          }
        } else {
          alert('Tävling inte hittad')
          router.push('/admin')
        }
      }
    } catch (error) {
      console.error('Error loading competition:', error)
      alert('Fel vid laddning av tävling')
      router.push('/admin')
    } finally {
      setLoading(false)
    }
  }, [params.id, router, updateFields])

  // Load competition
  useEffect(() => {
    loadCompetition()
  }, [loadCompetition])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await submit(async (data) => {
      try {
        const competitionData: Partial<Competition> = {
          ...data,
          equipment: data.equipment.split(',').map(item => item.trim()).filter(Boolean),
          maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : undefined,
          id: params.id,
        }

        const response = await fetch('/api/competitions', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(competitionData),
        })
        
        const responseData = await response.json()
        if (responseData.success) {
          // Clear draft
          if (typeof window !== 'undefined') {
            localStorage.removeItem(`competition-edit-${params.id}`)
          }
          alert('Tävling uppdaterad!')
          router.push('/admin')
        } else {
          alert('Fel vid uppdatering: ' + responseData.error)
        }
      } catch (error) {
        console.error('Error updating competition:', error)
        alert('Fel vid uppdatering av tävling')
      }
    })
  }

  const saveDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`competition-edit-${params.id}`, JSON.stringify(formData))
      setLastSaved(new Date())
      alert('Utkast sparat!')
    }
  }

  const resetToOriginal = () => {
    if (originalCompetition) {
      updateFields({
        title: originalCompetition.title,
        description: originalCompetition.description,
        date: originalCompetition.date,
        registrationDeadline: originalCompetition.registrationDeadline || '',
        organizer: originalCompetition.organizer,
        location: originalCompetition.location,
        status: originalCompetition.status,
        category: originalCompetition.category,
        maxParticipants: originalCompetition.maxParticipants?.toString() || '',
        registrationUrl: originalCompetition.registrationUrl || '',
        resultsUrl: originalCompetition.resultsUrl || '',
        contactEmail: originalCompetition.contactEmail || '',
        fee: originalCompetition.fee || '',
        equipment: originalCompetition.equipment?.join(', ') || '',
        rules: originalCompetition.rules || '',
        imageUrl: originalCompetition.imageUrl || '',
        imageAlt: originalCompetition.imageAlt || '',
      })
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`competition-edit-${params.id}`)
      }
      alert('Återställt till original!')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vgbf-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Laddar tävling...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-vgbf-blue">Redigera tävling</h1>
              <div className="flex items-center gap-4">
                {lastSaved && (
                  <span className="text-sm text-gray-500">
                    Senast sparat: {lastSaved.toLocaleTimeString('sv-SE')}
                  </span>
                )}
                <button
                  type="button"
                  onClick={saveDraft}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Spara utkast
                </button>
                <button
                  type="button"
                  onClick={resetToOriginal}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Återställ
                </button>
                <AdminBackButton />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Tävlingsnamn *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    placeholder="t.ex. DM Utomhus 2025"
                  />
                </div>

                <div>
                  <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-2">
                    Arrangör *
                  </label>
                  <input
                    type="text"
                    id="organizer"
                    name="organizer"
                    value={formData.organizer}
                    onChange={(e) => updateField('organizer', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    placeholder="t.ex. Göteborgs Bågskytteklubb"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Beskrivning *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                  placeholder="Beskriv tävlingen, vad som ingår, vem som kan delta, etc..."
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Tävlingsdatum *
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={(e) => updateField('date', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="registrationDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                    Anmälningsdeadline
                  </label>
                  <input
                    type="date"
                    id="registrationDeadline"
                    name="registrationDeadline"
                    value={formData.registrationDeadline}
                    onChange={(e) => updateField('registrationDeadline', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Plats *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    placeholder="t.ex. Göteborg"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value as Competition['category'])}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                  >
                    <option value="outdoor">Utomhus</option>
                    <option value="indoor">Inomhus</option>
                    <option value="3d">3D</option>
                    <option value="field">Fält</option>
                    <option value="other">Övrigt</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={(e) => updateField('status', e.target.value as Competition['status'])}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                  >
                    <option value="upcoming">Kommande</option>
                    <option value="ongoing">Pågående</option>
                    <option value="completed">Avslutad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bild
                </label>
                <ImageUpload
                  onImageUploaded={(imageUrl: string, imageAlt: string) => {
                    updateFields({ imageUrl, imageAlt })
                  }}
                  currentImageUrl={formData.imageUrl}
                  currentImageAlt={formData.imageAlt}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                    Max antal deltagare
                  </label>
                  <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={(e) => updateField('maxParticipants', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    placeholder="t.ex. 100"
                  />
                </div>

                <div>
                  <label htmlFor="fee" className="block text-sm font-medium text-gray-700 mb-2">
                    Avgift
                  </label>
                  <input
                    type="text"
                    id="fee"
                    name="fee"
                    value={formData.fee}
                    onChange={(e) => updateField('fee', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    placeholder="t.ex. 300 SEK"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="registrationUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Anmälningslänk
                  </label>
                  <input
                    type="url"
                    id="registrationUrl"
                    name="registrationUrl"
                    value={formData.registrationUrl}
                    onChange={(e) => updateField('registrationUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label htmlFor="resultsUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Resultatlänk
                  </label>
                  <input
                    type="url"
                    id="resultsUrl"
                    name="resultsUrl"
                    value={formData.resultsUrl}
                    onChange={(e) => updateField('resultsUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Kontakt e-post
                </label>
                <input
                  type="email"
                  id="contactEmail"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                  placeholder="tavling@klubb.se"
                />
              </div>

              <div>
                <label htmlFor="equipment" className="block text-sm font-medium text-gray-700 mb-2">
                  Utrustning (separera med komma)
                </label>
                <input
                  type="text"
                  id="equipment"
                  name="equipment"
                  value={formData.equipment}
                  onChange={(e) => updateField('equipment', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                  placeholder="t.ex. Recurve bow, Arrows, Finger tab"
                />
              </div>

              <div>
                <label htmlFor="rules" className="block text-sm font-medium text-gray-700 mb-2">
                  Regler och information
                </label>
                <textarea
                  id="rules"
                  name="rules"
                  value={formData.rules}
                  onChange={(e) => updateField('rules', e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                  placeholder="Beskriv regler, vad deltagarna behöver veta, vilka klasser som finns, etc..."
                />
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-vgbf-green text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Uppdaterar...' : 'Uppdatera tävling'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin')}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  )
}
