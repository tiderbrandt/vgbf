import Link from 'next/link'
import { getPublicEvents } from '@/lib/calendar-storage-postgres'
import { CalendarEvent } from '@/types'

// Server component: fetch calendar data directly from database
async function fetchPublicEvents() {
  try {
    // Fetch directly from database for server component
    const events = await getPublicEvents()
    return events
  } catch (e) {
    console.error('Failed to fetch calendar events', e)
    return []
  }
}

function parseDate(d: string | Date) {
  // If it's already a Date object, return it
  if (d instanceof Date) {
    return d
  }
  
  // Handle both ISO strings and simple date strings
  if (!d || typeof d !== 'string') {
    console.error('parseDate received invalid value:', d, typeof d)
    return new Date() // fallback to current date
  }
  
  if (d.includes('T')) {
    // ISO string like "2025-09-10T00:00:00.000Z"
    return new Date(d)
  } else {
    // Simple date string like "2025-09-10"
    const parts = d.split('-').map((p) => parseInt(p, 10))
    return new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1)
  }
}

function formatDateRange(ev: CalendarEvent) {
  if (ev.endDate) {
    const start = parseDate(ev.date)
    const end = parseDate(ev.endDate)
    const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
    const startOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
    const endOpts: Intl.DateTimeFormatOptions = { day: 'numeric' }
    if (!sameMonth) endOpts.month = 'short'
    if (end.getFullYear() !== start.getFullYear()) endOpts.year = 'numeric'

    const startFmt = start.toLocaleDateString('sv-SE', startOpts)
    const endFmt = end.toLocaleDateString('sv-SE', endOpts)
    return `${startFmt} — ${endFmt}`
  }
  const d = parseDate(ev.date)
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getUpcomingEvents(events: CalendarEvent[], limit = 4, now = new Date()) {
  if (!Array.isArray(events)) {
    console.error('getUpcomingEvents received non-array events:', events)
    return []
  }
  
  const upcoming = events
    .filter((e) => e && e.status === 'upcoming')
    .filter((e) => e.isPublic !== false)
    .filter((e) => e.date && (typeof e.date === 'string' || e.date instanceof Date))
    .map((e) => ({ ev: e, date: parseDate(e.date) }))
    .filter((x) => {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      return x.date >= todayStart
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, limit)
    .map(x => x.ev)

  return upcoming
}

export default async function UpcomingEvents() {
  try {
    const events = await fetchPublicEvents()
    const upcomingEvents = getUpcomingEvents(events, 4)

    if (upcomingEvents.length === 0) {
      return (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg p-6 border shadow-sm">
              <h3 className="text-xl font-semibold text-vgbf-blue mb-4">Kommande evenemang</h3>
              <p className="text-gray-600 mb-4">Inga publika evenemang planerade för tillfället.</p>
              <Link href="/kalender" className="inline-block text-sm text-vgbf-blue hover:underline">
                Se kalender →
              </Link>
            </div>
          </div>
        </section>
      )
    }

    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-vgbf-blue">Kommande evenemang</h3>
              <p className="text-gray-600 text-sm mt-1">Nästa publika evenemang</p>
            </div>
            
            <div className="divide-y divide-gray-100">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <Link 
                href="/kalender" 
                className="inline-flex items-center gap-2 text-sm text-vgbf-blue hover:text-blue-700 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
                Se alla evenemang
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  } catch (error) {
    console.error('UpcomingEvents: Error loading events:', error)
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <h3 className="text-xl font-semibold text-vgbf-blue">Kommande evenemang</h3>
            <p className="text-red-600 mt-2">Fel vid laddning av evenemang.</p>
          </div>
        </div>
      </section>
    )
  }
}

function EventCard({ event }: { event: CalendarEvent }) {
  const eventDate = parseDate(event.date)
  
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex gap-4">
        {/* Date Display */}
        <div className="flex-shrink-0">
          <div className="text-center bg-gradient-to-br from-vgbf-blue to-vgbf-green text-white rounded-lg px-3 py-2 min-w-[60px]">
            <div className="text-lg font-bold">{eventDate.toLocaleDateString('sv-SE', { day: 'numeric' })}</div>
            <div className="text-xs font-medium opacity-90">{eventDate.toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}</div>
          </div>
        </div>

        {/* Event Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900 text-sm leading-tight">{event.title}</h4>
            <span className={getTypeBadgeClass(event.type)} aria-hidden>
              {capitalize(event.type || 'evenemang')}
            </span>
          </div>
          
          <div className="text-xs text-gray-600 mb-2">
            <div className="flex items-center gap-1 mb-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
              </svg>
              <span>{formatDateRange(event)} {event.time && `• ${event.time}`}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{event.location}</span>
              </div>
            )}
          </div>
          
          {event.description && (
            <p className="text-xs text-gray-700 line-clamp-2 mb-2">{event.description}</p>
          )}
          
          {/* Registration info */}
          {typeof event.currentParticipants === 'number' && typeof event.maxParticipants === 'number' && (
            <div className="text-xs text-gray-600 mb-2">
              Anmälda: {event.currentParticipants}/{event.maxParticipants}
            </div>
          )}
          
          {/* Action button */}
          {event.registrationRequired && event.registrationUrl && (
            <a 
              href={event.registrationUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="inline-flex items-center gap-1 text-xs bg-vgbf-green text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Anmäl dig
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function capitalize(s?: string) {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function getTypeBadgeClass(type?: string) {
  const base = 'text-xs px-2 py-1 rounded-full font-medium'
  switch (type) {
    case 'competition':
      return base + ' bg-red-100 text-red-700'
    case 'course':
      return base + ' bg-green-100 text-green-700'
    case 'meeting':
      return base + ' bg-yellow-100 text-yellow-800'
    case 'social':
      return base + ' bg-purple-100 text-purple-700'
    default:
      return base + ' bg-gray-100 text-gray-700'
  }
}
