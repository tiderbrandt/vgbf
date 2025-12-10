'use client'

import { useState, useEffect } from 'react'
import { CalendarEvent } from '@/types'

// Type for external competitions from ICS feed
type ExternalCompetition = {
  id: string
  title: string
  description?: string
  date: string
  endDate?: string
  location?: string
  category?: string
  status?: string
  organizer?: string
  contactEmail?: string
  registrationDeadline?: string
  isExternal: true
}

// Combined type for display
type DisplayEvent = CalendarEvent | ExternalCompetition

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

interface CalendarClientProps {
  initialEvents: CalendarEvent[]
  serverDate?: string
}

export default function CalendarClient({ initialEvents, serverDate }: CalendarClientProps) {
  const [currentDate, setCurrentDate] = useState(serverDate ? new Date(serverDate) : new Date())
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const [events] = useState<CalendarEvent[]>(initialEvents)
  const [externalCompetitions, setExternalCompetitions] = useState<ExternalCompetition[]>([])
  const [selectedEvent, setSelectedEvent] = useState<DisplayEvent | null>(null)
  const [view, setView] = useState<'month' | 'list'>('month')
  const [showExternal, setShowExternal] = useState(true)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(Object.keys(EVENT_TYPE_LABELS))

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Helper function to check if event is external
  const isExternalEvent = (event: DisplayEvent): event is ExternalCompetition => {
    return 'isExternal' in event && event.isExternal === true
  }

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  // Helper to generate Google Calendar URL
  const getGoogleCalendarUrl = (event: DisplayEvent) => {
    const title = encodeURIComponent(event.title)
    const details = encodeURIComponent(event.description || '')
    const location = encodeURIComponent(event.location || '')
    
    let start = new Date(event.date)
    let end = event.endDate ? new Date(event.endDate) : new Date(event.date)
    
    if (!isExternalEvent(event) && event.time) {
      const [hours, minutes] = event.time.split(':')
      start.setHours(parseInt(hours), parseInt(minutes))
      
      if (event.endTime) {
        const [endHours, endMinutes] = event.endTime.split(':')
        end.setHours(parseInt(endHours), parseInt(endMinutes))
      } else {
        end.setHours(start.getHours() + 1)
      }
    } else {
      // All day event
      end.setDate(end.getDate() + 1)
    }
    
    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '')
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${formatDate(start)}/${formatDate(end)}`
  }

  // Helper to download ICS file
  const downloadIcs = (event: DisplayEvent) => {
    let start = new Date(event.date)
    let end = event.endDate ? new Date(event.endDate) : new Date(event.date)
    
    if (!isExternalEvent(event) && event.time) {
      const [hours, minutes] = event.time.split(':')
      start.setHours(parseInt(hours), parseInt(minutes))
      
      if (event.endTime) {
        const [endHours, endMinutes] = event.endTime.split(':')
        end.setHours(parseInt(endHours), parseInt(endMinutes))
      } else {
        end.setHours(start.getHours() + 1)
      }
    } else {
      end.setDate(end.getDate() + 1)
    }

    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '')
    
    const content = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || ''}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n')

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute('download', `${event.title}.ics`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    const fetchExternalCompetitions = async () => {
      try {
        const response = await fetch('/api/external-competitions')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setExternalCompetitions(data.data)
          }
        }
      } catch (error) {
        console.error('Error fetching external competitions:', error)
      }
    }

    if (showExternal && externalCompetitions.length === 0) {
      fetchExternalCompetitions()
    }
  }, [showExternal, externalCompetitions.length])

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
    const localEvents = events.filter(event => {
      // Parse event dates properly - they come as ISO strings from API
      const eventStart = new Date(event.date).toISOString().split('T')[0]
      const eventEnd = event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : eventStart
      const type = event.type || 'other'
      return dateStr >= eventStart && dateStr <= eventEnd && selectedTypes.includes(type)
    })
    
    const extEvents = (showExternal && selectedTypes.includes('competition')) ? externalCompetitions.filter(comp => {
      const eventStart = comp.date
      const eventEnd = comp.endDate || comp.date
      return dateStr >= eventStart && dateStr <= eventEnd
    }) : []
    
    return [...localEvents, ...extEvents]
  }

  const formatTime = (time?: string, endTime?: string) => {
    if (!time) return 'Ej specificerad'
    if (endTime) {
      return `${time} - ${endTime}`
    }
    return time
  }

  const formatDate = (dateValue?: string | Date, endDateValue?: string | Date) => {
    if (!dateValue) return 'Ej specificerat'
    
    try {
      let date: Date
      if (dateValue instanceof Date) {
        date = dateValue
      } else {
        date = new Date(dateValue + (dateValue.includes('T') ? '' : 'T00:00:00'))
      }
      
      const formatter = new Intl.DateTimeFormat('sv-SE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      
      if (endDateValue && endDateValue !== dateValue) {
        let endDate: Date
        if (endDateValue instanceof Date) {
          endDate = endDateValue
        } else {
          endDate = new Date(endDateValue + (endDateValue.includes('T') ? '' : 'T00:00:00'))
        }
        const endFormatter = new Intl.DateTimeFormat('sv-SE', {
          month: 'long',
          day: 'numeric'
        })
        return `${formatter.format(date)} - ${endFormatter.format(endDate)}`
      }
      
      return formatter.format(date)
    } catch (error) {
      console.error('Date formatting error:', error, 'for date:', dateValue)
      return dateValue instanceof Date ? dateValue.toLocaleDateString('sv-SE') : (dateValue || 'Ogiltigt datum')
    }
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
                selectedTypes.includes(type)
                  ? EVENT_TYPE_COLORS[type as keyof typeof EVENT_TYPE_COLORS]
                  : 'bg-white text-gray-400 border-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
          <div className="h-6 w-px bg-gray-300 mx-2 hidden md:block"></div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showExternal}
              onChange={(e) => setShowExternal(e.target.checked)}
              className="mr-2 h-4 w-4 text-vgbf-blue focus:ring-vgbf-blue border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Visa rikstävlingar</span>
          </label>
        </div>

        {/* View Toggle and Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex space-x-2 w-full md:w-auto">
            <button
              onClick={() => setView('month')}
              className={`flex-1 md:flex-none px-4 py-2 rounded ${view === 'month' 
                ? 'bg-vgbf-blue text-white' 
                : 'bg-white text-gray-700 border'
              }`}
            >
              Månadsvy
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex-1 md:flex-none px-4 py-2 rounded ${view === 'list' 
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
              <div className="text-center">
                <h2 className="text-xl font-semibold">
                  {MONTHS[month]} {year}
                </h2>
              </div>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 rounded hover:bg-gray-200"
              >
                →
              </button>
            </div>
          )}
        </div>

        {view === 'month' && (
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
                const isToday = isClient && day.toDateString() === new Date().toDateString()
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
                      {dayEvents.slice(0, 3).map(event => {
                        // Check if this is an external event
                        const isExternal = isExternalEvent(event)
                        const eventType = isExternal ? 'competition' : (event.type || 'other')
                        const colorClass = EVENT_TYPE_COLORS[eventType as keyof typeof EVENT_TYPE_COLORS] || EVENT_TYPE_COLORS.other
                        
                        return (
                          <div
                            key={event.id}
                            onClick={() => {
                              try {
                                console.log('Event clicked:', event);
                                setSelectedEvent(event);
                              } catch (error) {
                                console.error('Error selecting event:', error);
                              }
                            }}
                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${colorClass} ${
                              isExternal ? 'border-2 border-dashed' : ''
                            }`}
                          >
                            <div className="font-medium truncate">
                              {isExternal && '🏆 '}{event.title}
                            </div>
                            <div className="truncate">
                              {(!isExternal && event.time) ? formatTime(event.time, event.endTime) : 'Heldag'}
                            </div>
                          </div>
                        )
                      })}
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

        {view === 'list' && (
          <div className="space-y-4">
            {[...events, ...(showExternal ? externalCompetitions : [])]
              .filter(event => {
                // Filter for future events, handling timezone properly
                const eventDate = new Date(event.date)
                const today = new Date()
                today.setHours(0, 0, 0, 0) // Reset time to start of day
                
                // Filter by type
                const isExternal = isExternalEvent(event)
                const type = isExternal ? 'competition' : (event.type || 'other')
                
                return eventDate >= today && selectedTypes.includes(type)
              })
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map(event => {
                const isExternal = isExternalEvent(event)
                const eventType = isExternal ? 'competition' : (event.type || 'other')
                const eventTypeLabel = EVENT_TYPE_LABELS[eventType as keyof typeof EVENT_TYPE_LABELS] || eventType
                const eventTypeColor = EVENT_TYPE_COLORS[eventType as keyof typeof EVENT_TYPE_COLORS] || EVENT_TYPE_COLORS.other
                
                return (
                  <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1">
                          <span className={`px-2 py-1 rounded text-xs ${eventTypeColor}`}>
                            {isExternal && '🏆 '}{eventTypeLabel}
                          </span>
                          <span>{formatDate(event.date, event.endDate)}</span>
                          <span>{!isExternal && event.time ? formatTime(event.time, event.endTime) : 'Heldag'}</span>
                          {event.location && <span>📍 {event.location}</span>}
                        </div>
                      </div>
                      <div className="flex space-x-2 shrink-0">
                        <button
                          onClick={() => downloadIcs(event)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title="Ladda ner ICS"
                        >
                          📅
                        </button>
                        <a
                          href={getGoogleCalendarUrl(event)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                          title="Lägg till i Google Kalender"
                        >
                          G
                        </a>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{event.description}</p>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="text-sm text-gray-600 w-full sm:w-auto">
                        {event.organizer && (
                          <span>Arrangör: {event.organizer}</span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2 w-full sm:w-auto justify-end">
                        {!isExternal && event.registrationRequired && event.registrationUrl && (
                          <a
                            href={event.registrationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-vgbf-green text-white px-4 py-2 rounded hover:bg-green-600 transition-colors text-sm"
                          >
                            Anmäl dig
                          </a>
                        )}
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="text-vgbf-blue hover:underline text-sm px-4 py-2"
                        >
                          Mer info
                        </button>
                      </div>
                    </div>
                    
                    {!isExternal && event.maxParticipants && (
                      <div className="mt-4 text-sm text-gray-600">
                        Anmälda: {event.currentParticipants || 0}/{event.maxParticipants}
                      </div>
                    )}
                  </div>
                )
              })}
            
            {[...events, ...(showExternal ? externalCompetitions : [])].filter(e => {
               const eventDate = new Date(e.date)
               const today = new Date()
               today.setHours(0, 0, 0, 0)
               const isExternal = isExternalEvent(e)
               const type = isExternal ? 'competition' : (e.type || 'other')
               return eventDate >= today && selectedTypes.includes(type)
            }).length === 0 && (
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
                  {(() => {
                    // Check if this is an external competition (from ICS feed)
                    const isExternal = isExternalEvent(selectedEvent)
                    const eventType = isExternal ? 'competition' : (selectedEvent.type || 'other')
                    const colorClass = EVENT_TYPE_COLORS[eventType as keyof typeof EVENT_TYPE_COLORS] || EVENT_TYPE_COLORS.other
                    const labelText = EVENT_TYPE_LABELS[eventType as keyof typeof EVENT_TYPE_LABELS] || eventType
                    
                    return (
                      <span className={`px-2 py-1 rounded text-sm ${colorClass}`}>
                        {isExternal && '🏆 '}{labelText}
                      </span>
                    )
                  })()}
                </div>
                
                <div className="text-gray-700">
                  <strong>Datum:</strong> {formatDate(selectedEvent.date, selectedEvent.endDate)}
                </div>
                
                <div className="text-gray-700">
                  <strong>Tid:</strong> {!isExternalEvent(selectedEvent) && selectedEvent.time ? formatTime(selectedEvent.time, selectedEvent.endTime) : 'Ej specificerad'}
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
              
              {!isExternalEvent(selectedEvent) && selectedEvent.maxParticipants && (
                <div className="text-sm text-gray-600 mb-4">
                  Anmälda: {selectedEvent.currentParticipants || 0}/{selectedEvent.maxParticipants}
                </div>
              )}
              
              <div className="flex flex-wrap gap-3">
                {!isExternalEvent(selectedEvent) && selectedEvent.registrationRequired && selectedEvent.registrationUrl && (
                  <a
                    href={selectedEvent.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-vgbf-green text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    Anmäl dig
                  </a>
                )}
                
                {!isExternalEvent(selectedEvent) && selectedEvent.contactEmail && (
                  <a
                    href={`mailto:${selectedEvent.contactEmail}`}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                  >
                    Kontakta arrangör
                  </a>
                )}

                <button
                  onClick={() => downloadIcs(selectedEvent)}
                  className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                >
                  <span className="mr-2">📅</span> Spara
                </button>
                <a
                  href={getGoogleCalendarUrl(selectedEvent)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                >
                  <span className="mr-2">G</span> Google
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}