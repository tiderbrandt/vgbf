'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import { CalendarEvent } from '@/types'
import { useToast } from '@/contexts/ToastContext'
import Cookies from 'js-cookie'

const EVENT_TYPE_OPTIONS = [
  { value: 'competition', label: 'Tävling' },
  { value: 'meeting', label: 'Möte' },
  { value: 'training', label: 'Träning' },
  { value: 'course', label: 'Kurs' },
  { value: 'social', label: 'Socialt' },
  { value: 'other', label: 'Övrigt' }
]

const STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Kommande' },
  { value: 'ongoing', label: 'Pågående' },
  { value: 'completed', label: 'Avslutad' },
  { value: 'cancelled', label: 'Inställd' }
]

export default function AdminCalendarPage() {
  const router = useRouter()
  const { success, error } = useToast()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    time: '',
    endTime: '',
    location: '',
    type: 'other' as CalendarEvent['type'],
    organizer: '',
    contactEmail: '',
    registrationRequired: false,
    registrationUrl: '',
    maxParticipants: '',
    currentParticipants: '',
    status: 'upcoming' as CalendarEvent['status'],
    isPublic: true
  })

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const authToken = Cookies.get('auth-token')
      console.log('Fetching events with auth token:', authToken ? 'Present' : 'Missing')
      
      const response = await fetch('/api/calendar', {
        headers: authToken ? {
          'Authorization': `Bearer ${authToken}`
        } : {}
      })
      
      console.log('Calendar fetch response:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        setEvents(data.data || data)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Calendar fetch error:', response.status, errorData)
        error('Kunde inte ladda kalenderhändelser')
      }
    } catch (err) {
      console.error('Error fetching events:', err)
      error('Fel vid laddning av kalenderhändelser')
    } finally {
      setLoading(false)
    }
  }, [error])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const authToken = Cookies.get('auth-token')
      console.log('Submitting event with auth token:', authToken ? 'Present' : 'Missing')
      
      const eventData = {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        currentParticipants: formData.currentParticipants ? parseInt(formData.currentParticipants) : undefined,
        endDate: formData.endDate || undefined,
        endTime: formData.endTime || undefined,
        location: formData.location || undefined,
        organizer: formData.organizer || undefined,
        contactEmail: formData.contactEmail || undefined,
        registrationUrl: formData.registrationUrl || undefined
      }
      
      console.log('Event data to submit:', { title: eventData.title, date: eventData.date })

      let response
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
      
      if (editingEvent) {
        response = await fetch(`/api/calendar?id=${editingEvent.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(eventData)
        })
      } else {
        response = await fetch('/api/calendar', {
          method: 'POST',
          headers,
          body: JSON.stringify(eventData)
        })
      }
      
      console.log('Calendar submit response:', response.status, response.statusText)

      if (response.ok) {
        await fetchEvents()
        resetForm()
        success(editingEvent ? 'Händelse uppdaterad!' : 'Händelse skapad!')
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Calendar submit error:', response.status, errorData)
        error('Kunde inte spara händelse')
      }
    } catch (err) {
      console.error('Error saving event:', err)
      error('Fel vid sparande av händelse')
    }
  }

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      endDate: event.endDate || '',
      time: event.time,
      endTime: event.endTime || '',
      location: event.location || '',
      type: event.type,
      organizer: event.organizer || '',
      contactEmail: event.contactEmail || '',
      registrationRequired: event.registrationRequired,
      registrationUrl: event.registrationUrl || '',
      maxParticipants: event.maxParticipants?.toString() || '',
      currentParticipants: event.currentParticipants?.toString() || '',
      status: event.status,
      isPublic: event.isPublic
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna händelse?')) {
      return
    }

    try {
      setDeleting(id)
      const authToken = Cookies.get('auth-token')
      console.log('Deleting event with auth token:', authToken ? 'Present' : 'Missing')
      
      const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
      
      const response = await fetch(`/api/calendar?id=${id}`, {
        method: 'DELETE',
        headers
      })
      
      console.log('Calendar delete response:', response.status, response.statusText)

      if (response.ok) {
        await fetchEvents()
        success('Händelse borttagen!')
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Calendar delete error:', response.status, errorData)
        error('Kunde inte ta bort händelse')
      }
    } catch (err) {
      console.error('Error deleting event:', err)
      error('Fel vid borttagning av händelse')
    } finally {
      setDeleting(null)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      endDate: '',
      time: '',
      endTime: '',
      location: '',
      type: 'other',
      organizer: '',
      contactEmail: '',
      registrationRequired: false,
      registrationUrl: '',
      maxParticipants: '',
      currentParticipants: '',
      status: 'upcoming',
      isPublic: true
    })
    setEditingEvent(null)
    setShowForm(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE')
  }

  const getTypeLabel = (type: string) => {
    return EVENT_TYPE_OPTIONS.find(option => option.value === type)?.label || type
  }

  const getStatusLabel = (status: string) => {
    return STATUS_OPTIONS.find(option => option.value === status)?.label || status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'ongoing': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
                <h1 className="text-3xl font-bold text-vgbf-blue">Kalendern</h1>
                <p className="text-gray-600 mt-2">Hantera events och aktiviteter</p>
              </div>
              <div className="flex gap-3">
                <Link 
                  href="/admin"
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Tillbaka till admin
                </Link>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-vgbf-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ny händelse
                </button>
              </div>
            </div>

            {/* Events List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 bg-gray-50 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Kalenderhändelser</h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-vgbf-blue"></div>
                  <p className="mt-2 text-gray-600">Laddar händelser...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Inga händelser hittades.</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 text-vgbf-blue hover:underline"
                  >
                    Skapa din första händelse
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Händelse
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Datum & Tid
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Typ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Åtgärder
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {event.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {event.description.length > 60 
                                  ? `${event.description.substring(0, 60)}...` 
                                  : event.description
                                }
                              </div>
                              {event.location && (
                                <div className="text-xs text-gray-400 mt-1">
                                  📍 {event.location}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(event.date)}
                              {event.endDate && event.endDate !== event.date && (
                                <span> - {formatDate(event.endDate)}</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {event.time}
                              {event.endTime && ` - ${event.endTime}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {getTypeLabel(event.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                              {getStatusLabel(event.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleEdit(event)}
                              className="text-vgbf-blue hover:text-blue-900 mr-3"
                            >
                              Redigera
                            </button>
                            <button
                              onClick={() => handleDelete(event.id)}
                              disabled={deleting === event.id}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {deleting === event.id ? 'Tar bort...' : 'Ta bort'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </ProtectedRoute>
  )
}
