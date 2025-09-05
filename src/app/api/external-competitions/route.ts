import { NextRequest, NextResponse } from 'next/server'

// Simple ICS parser for calendar events
function parseICS(icsContent: string) {
  const events = []
  const lines = icsContent.split('\n').map(line => line.trim())
  
  let currentEvent: any = null
  
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {}
    } else if (line === 'END:VEVENT' && currentEvent) {
      if (currentEvent.summary && currentEvent.dtstart) {
        events.push(currentEvent)
      }
      currentEvent = null
    } else if (currentEvent && line.includes(':')) {
      const [key, ...valueParts] = line.split(':')
      const value = valueParts.join(':')
      
      if (key === 'SUMMARY') {
        currentEvent.summary = value
      } else if (key === 'DESCRIPTION') {
        currentEvent.description = value
      } else if (key === 'LOCATION') {
        currentEvent.location = value
      } else if (key.startsWith('DTSTART')) {
        // Handle both DATE and DATETIME formats
        const dateValue = value.replace(/[TZ]/g, '')
        if (dateValue.length >= 8) {
          const year = dateValue.substring(0, 4)
          const month = dateValue.substring(4, 6)
          const day = dateValue.substring(6, 8)
          currentEvent.dtstart = `${year}-${month}-${day}`
        }
      } else if (key.startsWith('DTEND')) {
        const dateValue = value.replace(/[TZ]/g, '')
        if (dateValue.length >= 8) {
          const year = dateValue.substring(0, 4)
          const month = dateValue.substring(4, 6)
          const day = dateValue.substring(6, 8)
          currentEvent.dtend = `${year}-${month}-${day}`
        }
      } else if (key === 'UID') {
        currentEvent.uid = value
      }
    }
  }
  
  return events
}

// Convert ICS event to our Competition format
function convertToCompetition(icsEvent: any, index: number) {
  const name = icsEvent.summary || 'Okänd tävling'
  const description = icsEvent.description || ''
  const location = icsEvent.location || ''
  
  // Determine category based on name/description
  let category: 'outdoor' | 'indoor' | '3d' | 'field' | 'other' = 'other'
  const nameAndDesc = (name + ' ' + description).toLowerCase()
  
  if (nameAndDesc.includes('utomhus') || nameAndDesc.includes('outdoor')) {
    category = 'outdoor'
  } else if (nameAndDesc.includes('inomhus') || nameAndDesc.includes('indoor')) {
    category = 'indoor'
  } else if (nameAndDesc.includes('3d')) {
    category = '3d'
  } else if (nameAndDesc.includes('fält') || nameAndDesc.includes('field')) {
    category = 'field'
  }
  
  // Determine status based on date
  const today = new Date()
  const startDate = new Date(icsEvent.dtstart)
  const endDate = icsEvent.dtend ? new Date(icsEvent.dtend) : startDate
  
  let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming'
  if (endDate < today) {
    status = 'completed'
  } else if (startDate <= today && endDate >= today) {
    status = 'ongoing'
  }
  
  return {
    id: `ext-${icsEvent.uid || index}`,
    name,
    description,
    startDate: icsEvent.dtstart,
    endDate: icsEvent.dtend || icsEvent.dtstart,
    location,
    category,
    status,
    organizer: 'Svenska Bågskytteförbundet',
    registrationDeadline: '', // Not available in ICS
    maxParticipants: null, // Not available in ICS
    isExternal: true
  }
}

// This endpoint fetches competitions from the Swedish Archery Federation calendar
// and formats them for our system
export async function GET(request: NextRequest) {
  try {
    // Fetch the ICS calendar from resultat.bagskytte.se
    const response = await fetch('https://resultat.bagskytte.se/Event/Calendar/events.ics', {
      headers: {
        'User-Agent': 'VGBF Calendar Integration (contact@vgbf.se)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ICS calendar: ${response.status}`)
    }
    
    const icsContent = await response.text()
    const icsEvents = parseICS(icsContent)
    
    // Convert ICS events to our Competition format
    const competitions = icsEvents.map((event, index) => convertToCompetition(event, index))
    
    // Filter to only include future and recent events (last 30 days to 1 year ahead)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
    
    const filteredCompetitions = competitions.filter(comp => {
      const startDate = new Date(comp.startDate)
      return startDate >= thirtyDaysAgo && startDate <= oneYearFromNow
    })
    
    // Sort by start date
    filteredCompetitions.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

    return NextResponse.json({
      success: true,
      data: filteredCompetitions,
      count: filteredCompetitions.length,
      source: 'resultat.bagskytte.se',
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching external competitions:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch external competitions'
    }, { status: 500 })
  }
}
