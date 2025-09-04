'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ImageUpload from '@/components/admin/ImageUpload'
import { Sponsor } from '@/types'
import { useToast } from '@/contexts/ToastContext'

export default function EditSponsorPage() {
  const router = useRouter()
  const params = useParams()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    website: '',
    logoUrl: '',
    logoAlt: '',
    priority: 99,
    isActive: true,
    addedDate: '',
    updatedAt: ''
  })

  const loadSponsor = useCallback(async (id: string) => {
    try {
      const response = await fetch('/api/sponsors')
      const data = await response.json()
      if (data.success) {
        const sponsor = data.data.find((s: Sponsor) => s.id === id)
        if (sponsor) {
          setFormData(sponsor)
        } else {
          error('Sponsor hittades inte', 'Den begärda sponsorn kunde inte hittas.')
          router.push('/admin/sponsors')
        }
      }
    } catch (err) {
      console.error('Error loading sponsor:', err)
      error('Fel vid laddning', 'Ett oväntat fel inträffade.')
    } finally {
      setInitialLoading(false)
    }
  }, [error, router])

  useEffect(() => {
    if (params.id) {
      loadSponsor(params.id as string)
    }
  }, [params.id, loadSponsor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/sponsors', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        success('Sponsor uppdaterad!', `"${formData.name}" har uppdaterats.`)
        router.push('/admin/sponsors')
      } else {
        error('Fel vid uppdatering', data.error || 'Ett oväntat fel inträffade.')
      }
    } catch (err) {
      console.error('Error updating sponsor:', err)
      error('Fel vid uppdatering', 'Ett oväntat fel inträffade.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : 
               type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               value
    }))
  }

  const handleImageUpload = (url: string, alt: string) => {
    setFormData(prev => ({
      ...prev,
      logoUrl: url,
      logoAlt: alt || prev.logoAlt || `${prev.name} logotyp`
    }))
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vgbf-blue mx-auto mb-4"></div>
            <p>Laddar sponsor...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-vgbf-blue">Redigera sponsor</h1>
              <p className="text-gray-600 mt-2">Uppdatera information för &ldquo;{formData.name}&rdquo;</p>
            </div>
            <Link
              href="/admin/sponsors"
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Tillbaka
            </Link>
          </div>

          {/* Form */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
              {/* Basic Information */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Grundläggande information</h2>
                
                <div className="mb-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Sponsornamn *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vgbf-blue"
                    placeholder="T.ex. Consid AB"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Beskrivning
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vgbf-blue"
                    placeholder="Kort beskrivning av sponsorn..."
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Webbplats
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vgbf-blue"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              {/* Logo */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Logotyp</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ladda upp logotyp
                  </label>
                  <ImageUpload
                    onImageUploaded={handleImageUpload}
                    currentImageUrl={formData.logoUrl}
                    currentImageAlt={formData.logoAlt}
                    contentType="sponsors"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="logoAlt" className="block text-sm font-medium text-gray-700 mb-2">
                    Alt-text för logotyp
                  </label>
                  <input
                    type="text"
                    id="logoAlt"
                    name="logoAlt"
                    value={formData.logoAlt}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vgbf-blue"
                    placeholder="T.ex. Consid logotyp"
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Inställningar</h2>
                
                <div className="mb-6">
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Prioritet (lägre nummer = högre prioritet)
                  </label>
                  <input
                    type="number"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    min="1"
                    max="999"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-vgbf-blue"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Sponsorer sorteras efter prioritet. Lägre nummer visas först.
                  </p>
                </div>

                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-vgbf-blue focus:ring-vgbf-blue"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Aktiv sponsor (visas på webbplatsen)
                    </span>
                  </label>
                </div>
              </div>

              {/* Metadata */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Metadata</h3>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Sponsor-ID: {formData.id}</div>
                  <div>Tillagd: {new Date(formData.addedDate).toLocaleString('sv-SE')}</div>
                  <div>Senast uppdaterad: {new Date(formData.updatedAt).toLocaleString('sv-SE')}</div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || !formData.name}
                  className="flex-1 bg-vgbf-blue text-white px-6 py-3 rounded-lg hover:bg-vgbf-green transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sparar...' : 'Uppdatera sponsor'}
                </button>
                <Link
                  href="/admin/sponsors"
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-center"
                >
                  Avbryt
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
