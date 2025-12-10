import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import CalendarClient from '@/components/CalendarClient'
import { getAllCalendarEvents } from '@/lib/calendar-storage-postgres'

export const metadata = {
  title: 'Kalender | VGBF',
  description: 'Kalender för Västra Götalands Bågskytteförbund. Här hittar du tävlingar, möten och utbildningar.',
}

export default async function CalendarPage() {
  // Fetch initial events on the server
  const initialEvents = await getAllCalendarEvents()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <Hero 
          title="Kalender" 
          subtitle="Håll koll på vad som händer i distriktet"
          backgroundImage="/images/hero-calendar.jpg"
        />
        
        <CalendarClient initialEvents={initialEvents} />
      </main>
      
      <Footer />
    </div>
  )
}
