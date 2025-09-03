'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Competition } from '@/types'
import ImageUpload from '@/components/admin/ImageUpload'
import { useToast } from '@/contexts/ToastContext'

export default function NewCompetitionPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [formData, setFormData] = useState({
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
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Autosave functionality
  useEffect(() => {
    const savedDraft = localStorage.getItem('competition-draft')
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        setFormData(draft)
      } catch (error) {
        console.error('Error loading draft:', error)
      }
    }
  }, [])

  // Save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.title || formData.description) {
        localStorage.setItem('competition-draft', JSON.stringify(formData))
        setLastSaved(new Date())
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [formData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const competitionData: Partial<Competition> = {
        ...formData,
        equipment: formData.equipment.split(',').map(item => item.trim()).filter(Boolean),
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
      }

      const response = await fetch('/api/competitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(competitionData),
      })
      
      const data = await response.json()
      if (data.success) {
        // Clear draft
        localStorage.removeItem('competition-draft')
        success('Tävling skapad!', 'Tävlingen har skapats framgångsrikt.')
        router.push('/admin')
      } else {
        error('Fel vid skapande', data.error || 'Ett oväntat fel inträffade.')
      }
    } catch (err) {
      console.error('Error saving competition:', err)
      error('Fel vid skapande', 'Ett oväntat fel inträffade vid skapande av tävlingen.')
    } finally {
      setSaving(false)
    }
  }

  const saveDraft = () => {
    localStorage.setItem('competition-draft', JSON.stringify(formData))
    setLastSaved(new Date())
    success('Utkast sparat!', 'Utkastet har sparats lokalt.')
  }

  const clearDraft = () => {
    localStorage.removeItem('competition-draft')
    setFormData({
      title: '',
      description: '',
      date: '',
      registrationDeadline: '',
      organizer: '',
      location: '',
      status: 'upcoming',
      category: 'outdoor',
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
    success('Utkast raderat!', 'Utkastet har raderats och formuläret har återställts.')
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-vgbf-blue">Skapa ny tävling</h1>
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
                  onClick={clearDraft}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Rensa
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin')}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Tillbaka
                </button>
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                  onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    setFormData(prev => ({ ...prev, imageUrl, imageAlt }))
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    placeholder="https://..."
                  />
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
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    placeholder="tavling@klubb.se"
                  />
                </div>
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  {saving ? 'Skapar...' : 'Skapa tävling'}
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
