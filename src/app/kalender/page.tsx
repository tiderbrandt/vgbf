'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CalendarEvent } from '@/types'

const MONTHS = [
  'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
  'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
]

const WEEKDAYS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']

const EVENT_TYPE_COLORS = {
  competition: 'bg-red-100 text-red-800 border-red-200',
  meeting: 'bg-blue-100 text-blue-800 border-blue-200',
  training: 'bg-green-100 text-green-800 border-green-200',
  course: 'bg-purple-100 text-purple-800 border-purple-200',
  social: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200'
}

const EVENT_TYPE_LABELS = {
  competition: 'Tävling',
  meeting: 'Möte',
  training: 'Träning',
  course: 'Kurs',
  social: 'Socialt',
  other: 'Övrigt'
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'month' | 'list'>('month')

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  useEffect(() => {
    fetchEvents()
  }, [year, month])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/calendar?public=true&year=${year}&month=${month + 1}`)
      if (response.ok) {
        const eventsData = await response.json()
        setEvents(eventsData)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDate = new Date(firstDay)
    
    // Adjust to start on Monday (getDay() returns 0 for Sunday)
    const dayOfWeek = (firstDay.getDay() + 6) % 7
    startDate.setDate(1 - dayOfWeek)

    const days = []
    for (let i = 0; i < 42; i++) { // 6 weeks
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }

    return days
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => {
      const eventStart = event.date
      const eventEnd = event.endDate || event.date
      return dateStr >= eventStart && dateStr <= eventEnd
    })
  }

  const formatTime = (time: string, endTime?: string) => {
    if (endTime) {
      return `${time} - ${endTime}`
    }
    return time
  }

  const formatDate = (dateStr: string, endDateStr?: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const formatter = new Intl.DateTimeFormat('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    if (endDateStr && endDateStr !== dateStr) {
      const endDate = new Date(endDateStr + 'T00:00:00')
      const endFormatter = new Intl.DateTimeFormat('sv-SE', {
        month: 'long',
        day: 'numeric'
      })
      return `${formatter.format(date)} - ${endFormatter.format(endDate)}`
    }
    
    return formatter.format(date)
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="bg-gray-50">
        {/* Hero Section */}
        <div className="bg-vgbf-blue text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Kalender</h1>
            <p className="text-blue-100 mt-2">
              Kommande evenemang och aktiviteter inom VGBF
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* View Toggle */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setView('month')}
                className={`px-4 py-2 rounded ${view === 'month' 
                  ? 'bg-vgbf-blue text-white' 
                  : 'bg-white text-gray-700 border'
                }`}
              >
                Månadsvy
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded ${view === 'list' 
                  ? 'bg-vgbf-blue text-white' 
                  : 'bg-white text-gray-700 border'
                }`}
              >
                Listvy
              </button>
            </div>

            {view === 'month' && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded hover:bg-gray-200"
                >
                  ←
                </button>
                <h2 className="text-xl font-semibold">
                  {MONTHS[month]} {year}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded hover:bg-gray-200"
                >
                  →
                </button>
              </div>
            )}
          </div>

          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-600">Laddar evenemang...</p>
            </div>
          )}

          {!loading && view === 'month' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Calendar Header */}
              <div className="grid grid-cols-7 bg-gray-50">
                {WEEKDAYS.map(day => (
                  <div key={day} className="p-4 text-center font-medium text-gray-700">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {getDaysInMonth().map((day, index) => {
                  const isCurrentMonth = day.getMonth() === month
                  const isToday = day.toDateString() === new Date().toDateString()
                  const dayEvents = getEventsForDate(day)

                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] p-2 border-r border-b ${
                        isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                      } ${isToday ? 'bg-blue-50' : ''}`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${isToday ? 'text-vgbf-blue font-bold' : ''}`}>
                        {day.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map(event => (
                          <div
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${
                              EVENT_TYPE_COLORS[event.type]
                            }`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="truncate">{formatTime(event.time, event.endTime)}</div>
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 3} fler
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!loading && view === 'list' && (
            <div className="space-y-4">
              {events
                .filter(event => new Date(event.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(event => (
                  <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className={`px-2 py-1 rounded text-xs ${EVENT_TYPE_COLORS[event.type]}`}>
                            {EVENT_TYPE_LABELS[event.type]}
                          </span>
                          <span>{formatDate(event.date, event.endDate)}</span>
                          <span>{formatTime(event.time, event.endTime)}</span>
                          {event.location && <span>📍 {event.location}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{event.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        {event.organizer && (
                          <span>Arrangör: {event.organizer}</span>
                        )}
                      </div>
                      
                      {event.registrationRequired && event.registrationUrl && (
                        <a
                          href={event.registrationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-vgbf-green text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                        >
                          Anmäl dig
                        </a>
                      )}
                    </div>
                    
                    {event.maxParticipants && (
                      <div className="mt-4 text-sm text-gray-600">
                        Anmälda: {event.currentParticipants || 0}/{event.maxParticipants}
                      </div>
                    )}
                  </div>
                ))}
              
              {events.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">Inga evenemang hittades för denna period.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{selectedEvent.title}</h2>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-sm ${EVENT_TYPE_COLORS[selectedEvent.type]}`}>
                      {EVENT_TYPE_LABELS[selectedEvent.type]}
                    </span>
                  </div>
                  
                  <div className="text-gray-700">
                    <strong>Datum:</strong> {formatDate(selectedEvent.date, selectedEvent.endDate)}
                  </div>
                  
                  <div className="text-gray-700">
                    <strong>Tid:</strong> {formatTime(selectedEvent.time, selectedEvent.endTime)}
                  </div>
                  
                  {selectedEvent.location && (
                    <div className="text-gray-700">
                      <strong>Plats:</strong> {selectedEvent.location}
                    </div>
                  )}
                  
                  {selectedEvent.organizer && (
                    <div className="text-gray-700">
                      <strong>Arrangör:</strong> {selectedEvent.organizer}
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 mb-4">{selectedEvent.description}</p>
                
                {selectedEvent.maxParticipants && (
                  <div className="text-sm text-gray-600 mb-4">
                    Anmälda: {selectedEvent.currentParticipants || 0}/{selectedEvent.maxParticipants}
                  </div>
                )}
                
                <div className="flex space-x-3">
                  {selectedEvent.registrationRequired && selectedEvent.registrationUrl && (
                    <a
                      href={selectedEvent.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-vgbf-green text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                    >
                      Anmäl dig
                    </a>
                  )}
                  
                  {selectedEvent.contactEmail && (
                    <a
                      href={`mailto:${selectedEvent.contactEmail}`}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                    >
                      Kontakta arrangör
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
