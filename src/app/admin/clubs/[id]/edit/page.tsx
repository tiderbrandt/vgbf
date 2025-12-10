'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Cookies from 'js-cookie'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdminBackButton from '@/components/AdminBackButton'
import ImageUpload from '@/components/admin/ImageUpload'
import { Club } from '@/types'
import { useToast } from '@/contexts/ToastContext'
import { useFormState, useStringArrayField, useArrayField } from '@/hooks'

export default function EditClubPage() {
  const router = useRouter()
  const params = useParams()
  const { success, error } = useToast()
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Initialize form state with our custom hook
  const { formData, updateField, updateFields, isSubmitting: saving, submit } = useFormState({
    name: '',
    description: '',
    location: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    postalCode: '',
    city: '',
    established: '',
    activities: [] as string[],
    facilities: [] as string[],
    trainingTimes: [] as { day: string; time: string; type?: string }[],
    facebook: '',
    instagram: '',
    memberCount: '',
    membershipFee: '',
    welcomesNewMembers: true,
    imageUrl: '',
    imageAlt: '',
  })

  // Use array field hooks for managing dynamic arrays
  const activitiesField = useStringArrayField(
    formData.activities,
    (activities) => updateField('activities', activities)
  )
  
  const facilitiesField = useStringArrayField(
    formData.facilities,
    (facilities) => updateField('facilities', facilities)
  )
  
  const trainingTimesField = useArrayField(
    formData.trainingTimes,
    (trainingTimes) => updateField('trainingTimes', trainingTimes)
  )

  const [newActivity, setNewActivity] = useState('')
  const [newFacility, setNewFacility] = useState('')
  const [newTraining, setNewTraining] = useState({ day: '', time: '', type: '' })

  useEffect(() => {
    if (params.id) {
      loadClub()
    }
  }, [params.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadClub = async () => {
    try {
      const response = await fetch(`/api/clubs?id=${params.id}`)
      const data = await response.json()
      if (data.success && data.data) {
        const clubData = data.data
        setClub(clubData)
        updateFields({
          name: clubData.name || '',
          description: clubData.description || '',
          location: clubData.location || '',
          contactPerson: clubData.contactPerson || '',
          email: clubData.email || '',
          phone: clubData.phone || '',
          website: clubData.website || '',
          address: clubData.address || '',
          postalCode: clubData.postalCode || '',
          city: clubData.city || '',
          established: clubData.established || '',
          activities: clubData.activities || [],
          facilities: clubData.facilities || [],
          trainingTimes: clubData.trainingTimes || [],
          facebook: clubData.facebook || '',
          instagram: clubData.instagram || '',
          memberCount: clubData.memberCount?.toString() || '',
          membershipFee: clubData.membershipFee || '',
          welcomesNewMembers: clubData.welcomesNewMembers,
          imageUrl: clubData.imageUrl || '',
          imageAlt: clubData.imageAlt || '',
        })
      } else {
        error('Klubb hittades inte', 'Den begärda klubben kunde inte hittas.')
        router.push('/admin/clubs')
      }
    } catch (err) {
      console.error('Error loading club:', err)
      error('Fel vid hämtning', 'Ett oväntat fel inträffade vid hämtning av klubbdata.')
      router.push('/admin/clubs')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await submit(async (data) => {
      try {
        const clubData: Partial<Club> = {
          id: params.id as string,
          ...data,
          memberCount: data.memberCount ? parseInt(data.memberCount) : undefined,
          trainingTimes: data.trainingTimes.filter(t => t.day && t.time),
        }

        const response = await fetch('/api/clubs', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('auth-token')}`,
          },
          body: JSON.stringify(clubData),
        })

        const responseData = await response.json()
        if (responseData.success) {
          success('Klubb uppdaterad!', `${club?.name} har uppdaterats framgångsrikt.`)
          router.push('/admin/clubs')
        } else {
          error('Fel vid uppdatering', responseData.error || 'Ett oväntat fel inträffade.')
        }
      } catch (err) {
        console.error('Error updating club:', err)
        error('Fel vid uppdatering', 'Ett oväntat fel inträffade vid uppdatering av klubben.')
      }
    })
  }

  const handleAddActivity = () => {
    if (activitiesField.addString(newActivity)) {
      setNewActivity('')
    }
  }

  const handleAddFacility = () => {
    if (facilitiesField.addString(newFacility)) {
      setNewFacility('')
    }
  }

  const handleAddTrainingTime = () => {
    if (newTraining.day && newTraining.time) {
      trainingTimesField.add(newTraining)
      setNewTraining({ day: '', time: '', type: '' })
    }
  }

  const daysOfWeek = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag']

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p>Laddar klubb...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!club) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p>Klubb hittades inte</p>
            <AdminBackButton href="/admin/clubs">Tillbaka till klubbar</AdminBackButton>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-vgbf-blue">Redigera klubb</h1>
              <p className="text-gray-600 mt-2">Uppdatera information för {club.name}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.open(`/klubbar/${club.id}`, '_blank')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Förhandsgranska
              </button>
              <AdminBackButton href="/admin/clubs">Tillbaka till klubbar</AdminBackButton>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Grundläggande information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Klubbnamn *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Plats/Kommun *
                    </label>
                    <input
                      type="text"
                      id="location"
                      required
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Beskrivning *
                    </label>
                    <textarea
                      id="description"
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="established" className="block text-sm font-medium text-gray-700 mb-2">
                      Grundad år
                    </label>
                    <input
                      type="text"
                      id="established"
                      value={formData.established}
                      onChange={(e) => updateField('established', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="memberCount" className="block text-sm font-medium text-gray-700 mb-2">
                      Antal medlemmar
                    </label>
                    <input
                      type="number"
                      id="memberCount"
                      value={formData.memberCount}
                      onChange={(e) => updateField('memberCount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Kontaktinformation</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      E-post *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                      Kontaktperson
                    </label>
                    <input
                      type="text"
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => updateField('contactPerson', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                      Webbplats
                    </label>
                    <input
                      type="url"
                      id="website"
                      value={formData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Adress</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      Gatuadress
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Postnummer
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => updateField('postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      Stad *
                    </label>
                    <input
                      type="text"
                      id="city"
                      required
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Club Image */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Klubblogga</h3>
                <div className="space-y-4">
                  <ImageUpload
                    onImageUploaded={(url, alt) => updateFields({ imageUrl: url, imageAlt: alt })}
                    currentImageUrl={formData.imageUrl}
                    currentImageAlt={formData.imageAlt}
                    contentType="clubs"
                  />
                </div>
              </div>

              {/* Activities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktiviteter</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newActivity}
                      onChange={(e) => setNewActivity(e.target.value)}
                      placeholder="Lägg till aktivitet (t.ex. Utomhusbågskytte)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddActivity())}
                    />
                    <button
                      type="button"
                      onClick={handleAddActivity}
                      className="bg-vgbf-blue text-white px-4 py-2 rounded-lg hover:bg-vgbf-green transition-colors"
                    >
                      Lägg till
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.activities.map((activity, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-vgbf-blue text-white rounded-full text-sm">
                        {activity}
                        <button
                          type="button"
                          onClick={() => activitiesField.remove(index)}
                          className="hover:text-red-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Facilities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Faciliteter</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFacility}
                      onChange={(e) => setNewFacility(e.target.value)}
                      placeholder="Lägg till facilitet (t.ex. Utomhusbana 50m)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFacility())}
                    />
                    <button
                      type="button"
                      onClick={handleAddFacility}
                      className="bg-vgbf-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Lägg till
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.facilities.map((facility, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-vgbf-green text-white rounded-full text-sm">
                        {facility}
                        <button
                          type="button"
                          onClick={() => facilitiesField.remove(index)}
                          className="hover:text-red-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Training Times */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Träningstider</h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-2">
                    <select
                      value={newTraining.day}
                      onChange={(e) => setNewTraining(prev => ({ ...prev, day: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    >
                      <option value="">Välj dag</option>
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newTraining.time}
                      onChange={(e) => setNewTraining(prev => ({ ...prev, time: e.target.value }))}
                      placeholder="t.ex. 18:00-20:00"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={newTraining.type}
                      onChange={(e) => setNewTraining(prev => ({ ...prev, type: e.target.value }))}
                      placeholder="Typ (frivilligt)"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddTrainingTime}
                      className="bg-vgbf-gold text-vgbf-blue px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors"
                    >
                      Lägg till
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.trainingTimes.map((training, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                        <span>
                          <strong>{training.day}</strong> {training.time}
                          {training.type && <span className="text-gray-600"> ({training.type})</span>}
                        </span>
                        <button
                          type="button"
                          onClick={() => trainingTimesField.remove(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Ta bort
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Membership */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medlemskap</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="membershipFee" className="block text-sm font-medium text-gray-700 mb-2">
                      Medlemsavgift
                    </label>
                    <input
                      type="text"
                      id="membershipFee"
                      value={formData.membershipFee}
                      onChange={(e) => updateField('membershipFee', e.target.value)}
                      placeholder="t.ex. 500 kr/år"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tar emot nya medlemmar
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={formData.welcomesNewMembers}
                          onChange={() => updateField('welcomesNewMembers', true)}
                          className="mr-2"
                        />
                        Ja
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={!formData.welcomesNewMembers}
                          onChange={() => updateField('welcomesNewMembers', false)}
                          className="mr-2"
                        />
                        Nej
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sociala medier</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <input
                      type="url"
                      id="facebook"
                      value={formData.facebook}
                      onChange={(e) => updateField('facebook', e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="url"
                      id="instagram"
                      value={formData.instagram}
                      onChange={(e) => updateField('instagram', e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-vgbf-blue focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link
                  href="/admin/clubs"
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Avbryt
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-vgbf-gold text-vgbf-blue px-6 py-3 rounded-lg hover:bg-yellow-300 transition-colors font-semibold disabled:opacity-50"
                >
                  {saving ? 'Sparar...' : 'Uppdatera klubb'}
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
