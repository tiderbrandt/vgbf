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

function findNextEvent(events: CalendarEvent[], now = new Date()) {
  if (!Array.isArray(events)) {
    console.error('findNextEvent received non-array events:', events)
    return null
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

  return upcoming.length ? upcoming[0].ev : null
}

export default async function NextEvent() {
  try {
    const events = await fetchPublicEvents()
    const next = findNextEvent(events)

    if (!next) {
      return (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 border shadow-sm">
              <h3 className="text-xl font-semibold text-vgbf-blue">Kommande evenemang</h3>
              <p className="text-gray-600 mt-2">Inga publika evenemang planerade för tillfället.</p>
              <div className="mt-4">
                <Link href="/kalender" className="inline-block text-sm text-vgbf-blue hover:underline">Se kalender →</Link>
              </div>
            </div>
          </div>
        </section>
      )
    }

    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-white to-vgbf-blue/5 rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <div className="text-center bg-gradient-to-br from-vgbf-blue to-vgbf-green text-white rounded-xl px-6 py-4 shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <div className="text-2xl font-bold">{new Date(next.date).toLocaleDateString('sv-SE', { day: 'numeric' })}</div>
                  <div className="text-sm font-medium opacity-90">{new Date(next.date).toLocaleDateString('sv-SE', { month: 'short' }).toUpperCase()}</div>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-bold text-vgbf-blue leading-tight">{next.title}</h3>
                  <span className={getTypeBadgeClass(next.type)} aria-hidden>{capitalize(next.type || 'evenemang')}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDateRange(next)} {next.time ? `• ${next.time}` : ''}</span>
                  </div>
                </div>
                {next.location && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{next.location}</span>
                  </div>
                )}
                <p className="text-gray-700 text-sm leading-relaxed mb-4">{next.description}</p>

                {typeof next.currentParticipants === 'number' && typeof next.maxParticipants === 'number' && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
                      <div className="font-medium">Anmälningar: {next.currentParticipants}/{next.maxParticipants}</div>
                      <div className="font-bold text-vgbf-blue">{Math.round((next.currentParticipants / next.maxParticipants) * 100)}%</div>
                    </div>
                    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${Math.min(100, (next.currentParticipants / next.maxParticipants) * 100)}%` }} 
                        className="h-3 bg-gradient-to-r from-vgbf-green to-green-400 rounded-full transition-all duration-500 ease-out"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <Link href="/kalender" className="inline-flex items-center gap-2 px-6 py-3 bg-vgbf-blue text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                    </svg>
                    Fler evenemang
                  </Link>

                  {next.registrationRequired ? (
                    next.registrationUrl ? (
                      <a href={next.registrationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-vgbf-green text-white rounded-lg hover:bg-green-700 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Anmäl dig
                      </a>
                    ) : (
                      <button disabled className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-400 bg-gray-50 rounded-lg text-sm font-semibold cursor-not-allowed">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Anmälning stängd
                      </button>
                    )
                  ) : (
                    next.registrationUrl && (
                      <a href={next.registrationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-vgbf-blue text-vgbf-blue rounded-lg hover:bg-vgbf-blue hover:text-white text-sm font-semibold transition-all duration-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Mer info
                      </a>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  } catch (error) {
    console.error('NextEvent: Error loading next event:', error)
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 border shadow-sm">
            <h3 className="text-xl font-semibold text-vgbf-blue">Kommande evenemang</h3>
            <p className="text-red-600 mt-2">Fel vid laddning av evenemang.</p>
          </div>
        </div>
      </section>
    )
  }
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
