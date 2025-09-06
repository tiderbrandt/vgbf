'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ImageUpload from '@/components/admin/ImageUpload'
import { useToast } from '@/contexts/ToastContext'
import { useFormState } from '@/hooks/useFormState'

export default function NewSponsorPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Initialize form state with our custom hook
  const { formData, updateField } = useFormState({
    name: '',
    description: '',
    website: '',
    logoUrl: '',
    logoAlt: '',
    priority: 99,
    isActive: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/sponsors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        success('Sponsor skapad!', `"${formData.name}" har lagts till.`)
        router.push('/admin/sponsors')
      } else {
        error('Fel vid skapande', data.error || 'Ett oväntat fel inträffade.')
      }
    } catch (err) {
      console.error('Error creating sponsor:', err)
      error('Fel vid skapande', 'Ett oväntat fel inträffade.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (url: string, alt: string) => {
    updateField('logoUrl', url);
    updateField('logoAlt', alt || formData.logoAlt || `${formData.name} logotyp`);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-vgbf-blue">Lägg till ny sponsor</h1>
              <p className="text-gray-600 mt-2">Fyll i informationen nedan för att lägga till en ny sponsor</p>
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
                    onChange={(e) => updateField('name', e.target.value)}
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
                    onChange={(e) => updateField('description', e.target.value)}
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
                    onChange={(e) => updateField('website', e.target.value)}
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
                    onChange={(e) => updateField('logoAlt', e.target.value)}
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
                    onChange={(e) => updateField('priority', parseInt(e.target.value))}
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
                      onChange={(e) => updateField('isActive', e.target.checked)}
                      className="rounded border-gray-300 text-vgbf-blue focus:ring-vgbf-blue"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Aktiv sponsor (visas på webbplatsen)
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading || !formData.name}
                  className="flex-1 bg-vgbf-blue text-white px-6 py-3 rounded-lg hover:bg-vgbf-green transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sparar...' : 'Skapa sponsor'}
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
