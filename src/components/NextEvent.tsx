import Link from 'next/link'

// Server component: fetch calendar data from the API and pick next upcoming public event
type CalendarEvent = {
  id: string
  title: string
  description?: string
  date: string
  endDate?: string
  time?: string
  endTime?: string
  location?: string
  type?: string
  registrationUrl?: string
  isPublic?: boolean
  status?: string
  registrationRequired?: boolean
  maxParticipants?: number
  currentParticipants?: number
}
async function fetchPublicEvents() {
  try {
    const res = await fetch('/api/calendar?public=true', { next: { revalidate: 60 } })
    if (!res.ok) return []
    const events: CalendarEvent[] = await res.json()
    return events
  } catch (e) {
    console.error('Failed to fetch calendar events', e)
    return []
  }
}

function parseDate(d: string) {
  const parts = d.split('-').map((p) => parseInt(p, 10))
  return new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1)
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
  const upcoming = events
    .filter((e) => e.status === 'upcoming')
    .filter((e) => e.isPublic !== false)
    .map((e) => ({ ev: e, date: parseDate(e.date) }))
    .filter((x) => x.date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  return upcoming.length ? upcoming[0].ev : null
}

export default async function NextEvent() {
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
        <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 border shadow-sm hover:shadow-md transition">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <div className="flex-shrink-0">
              <div className="text-center bg-vgbf-blue text-white rounded-md px-4 py-3 shadow">
                <div className="text-lg font-bold">{new Date(next.date).toLocaleDateString('sv-SE', { day: 'numeric' })}</div>
                <div className="text-sm">{new Date(next.date).toLocaleDateString('sv-SE', { month: 'short' })}</div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-vgbf-blue">{next.title}</h3>
                <span className={getTypeBadgeClass(next.type)} aria-hidden>{capitalize(next.type || 'evenemang')}</span>
              </div>

              <div className="text-sm text-gray-600 mt-1">{formatDateRange(next)} {next.time ? `• ${next.time}` : ''}</div>
              {next.location && <div className="text-sm text-gray-600 mt-1">Plats: {next.location}</div>}
              <p className="mt-3 text-gray-700 text-sm">{next.description}</p>

              {typeof next.currentParticipants === 'number' && typeof next.maxParticipants === 'number' && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div>Anmälningar: {next.currentParticipants}/{next.maxParticipants}</div>
                    <div>{Math.round((next.currentParticipants / next.maxParticipants) * 100)}%</div>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded mt-1 overflow-hidden">
                    <div style={{ width: `${Math.min(100, (next.currentParticipants / next.maxParticipants) * 100)}%` }} className="h-2 bg-vgbf-blue" />
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                <Link href="/kalender" className="inline-flex items-center px-4 py-2 bg-vgbf-blue text-white rounded hover:bg-blue-700 text-sm font-medium">Fler evenemang</Link>

                {next.registrationRequired ? (
                  next.registrationUrl ? (
                    <a href={next.registrationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-2 border rounded text-sm hover:bg-gray-50">Anmäl dig</a>
                  ) : (
                    <button disabled className="inline-flex items-center px-3 py-2 border rounded text-sm text-gray-400 bg-gray-50 cursor-not-allowed">Anmälning stängd</button>
                  )
                ) : (
                  next.registrationUrl && (
                    <a href={next.registrationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-2 border rounded text-sm hover:bg-gray-50">Info</a>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
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
