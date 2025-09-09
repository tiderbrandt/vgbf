import Link from 'next/link'

// Server component: read calendar data at build/time and pick next upcoming event
import rawCalendar from '../../data/calendar.json'

type CalendarEvent = {
  id: string
  title: string
  description?: string
  date: string
  endDate?: string
  time?: string
  endTime?: string
  location?: string
  registrationUrl?: string
  isPublic?: boolean
  status?: string
}

const calendar: CalendarEvent[] = (rawCalendar as any) || []

function parseDate(d: string) {
  // parse YYYY-MM-DD
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

function findNextEvent(now = new Date()) {
  const upcoming = calendar
    .filter((e) => e.status === 'upcoming')
    .filter((e) => e.isPublic !== false) // prefer public events
    .map((e) => ({ ev: e, date: parseDate(e.date) }))
    .filter((x) => x.date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  return upcoming.length ? upcoming[0].ev : null
}

export default function NextEvent() {
  const next = findNextEvent()

  if (!next) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 border">
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
        <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 border hover:shadow-sm transition">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="text-center bg-vgbf-blue text-white rounded-md px-3 py-2">
                <div className="text-sm">{new Date(next.date).toLocaleDateString('sv-SE', { day: 'numeric' })}</div>
                <div className="text-xs">{new Date(next.date).toLocaleDateString('sv-SE', { month: 'short' })}</div>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold text-vgbf-blue">{next.title}</h3>
              <div className="text-sm text-gray-600 mt-1">{formatDateRange(next)} {next.time ? `• ${next.time}` : ''}</div>
              {next.location && <div className="text-sm text-gray-600 mt-1">Plats: {next.location}</div>}
              <p className="mt-3 text-gray-700 text-sm">{next.description}</p>

              <div className="mt-4 flex items-center gap-3">
                <Link href="/kalender" className="inline-flex items-center px-4 py-2 bg-vgbf-blue text-white rounded hover:bg-blue-700 text-sm font-medium">Fler evenemang</Link>
                {next.registrationUrl && (
                  <a href={next.registrationUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-3 py-2 border rounded text-sm hover:bg-gray-50">Anmäl dig</a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
