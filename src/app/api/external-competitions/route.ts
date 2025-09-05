import { NextRequest, NextResponse } from 'next/server'

// Simple ICS parser for calendar events
function parseICS(icsContent: string) {
  try {
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
        const colonIndex = line.indexOf(':')
        const key = line.substring(0, colonIndex)
        const value = line.substring(colonIndex + 1)
        
        if (key === 'SUMMARY') {
          currentEvent.summary = value
        } else if (key === 'DESCRIPTION') {
          currentEvent.description = value
        } else if (key === 'LOCATION') {
          currentEvent.location = value
        } else if (key.startsWith('DTSTART')) {
          // Handle both DATE and DATETIME formats
          const dateValue = value.replace(/[TZ]/g, '').substring(0, 8)
          if (dateValue.length === 8) {
            const year = dateValue.substring(0, 4)
            const month = dateValue.substring(4, 6)
            const day = dateValue.substring(6, 8)
            currentEvent.dtstart = `${year}-${month}-${day}`
          }
        } else if (key.startsWith('DTEND')) {
          const dateValue = value.replace(/[TZ]/g, '').substring(0, 8)
          if (dateValue.length === 8) {
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
    
    console.log(`Successfully parsed ${events.length} events from ICS`)
    return events
  } catch (error) {
    console.error('Error parsing ICS content:', error)
    return []
  }
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
    console.log('Fetching external competitions from ICS calendar...')
    
    // Fetch the ICS calendar from resultat.bagskytte.se
    // Note: Some servers may have SSL certificate issues in development
    const response = await fetch('https://resultat.bagskytte.se/Event/Calendar/events.ics', {
      headers: {
        'User-Agent': 'VGBF Calendar Integration (contact@vgbf.se)'
      }
    })
    
    if (!response.ok) {
      console.error(`Failed to fetch ICS calendar: ${response.status} ${response.statusText}`)
      throw new Error(`Failed to fetch ICS calendar: ${response.status}`)
    }
    
    const icsContent = await response.text()
    console.log(`Fetched ICS content, size: ${icsContent.length} characters`)
    
    const icsEvents = parseICS(icsContent)
    console.log(`Parsed ${icsEvents.length} events from ICS`)
    
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
    
    console.log(`Returning ${filteredCompetitions.length} filtered competitions`)

    return NextResponse.json({
      success: true,
      data: filteredCompetitions,
      count: filteredCompetitions.length,
      source: 'resultat.bagskytte.se',
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching external competitions:', error)
    
    // For development, let's try an alternative approach
    if (process.env.NODE_ENV === 'development') {
      try {
        console.log('Trying alternative fetch method for development...')
        // In development, we might need to disable SSL verification
        const https = require('https')
        const agent = new https.Agent({
          rejectUnauthorized: false
        })
        
        const response = await fetch('https://resultat.bagskytte.se/Event/Calendar/events.ics', {
          headers: {
            'User-Agent': 'VGBF Calendar Integration (contact@vgbf.se)'
          },
          // @ts-ignore - agent is not typed for fetch but works in Node.js
          agent: agent
        })
        
        if (response.ok) {
          const icsContent = await response.text()
          const icsEvents = parseICS(icsContent)
          const competitions = icsEvents.map((event, index) => convertToCompetition(event, index))
          
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          const oneYearFromNow = new Date()
          oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
          
          const filteredCompetitions = competitions.filter(comp => {
            const startDate = new Date(comp.startDate)
            return startDate >= thirtyDaysAgo && startDate <= oneYearFromNow
          })
          
          filteredCompetitions.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          
          return NextResponse.json({
            success: true,
            data: filteredCompetitions,
            count: filteredCompetitions.length,
            source: 'resultat.bagskytte.se',
            note: 'Development mode with SSL bypass',
            lastUpdated: new Date().toISOString()
          })
        }
      } catch (devError) {
        console.error('Development fetch also failed:', devError)
      }
    }
    
    // Fallback to mock data if external service fails
    const mockCompetitions = [
      {
        id: 'ext-fallback-1',
        name: 'SM Fältbågskytte (Extern)',
        description: 'Svenska mästerskapen i fältbågskytte',
        startDate: '2025-09-20',
        endDate: '2025-09-21',
        location: 'Göteborg',
        category: 'field' as const,
        status: 'upcoming' as const,
        organizer: 'Svenska Bågskytteförbundet',
        registrationDeadline: '',
        maxParticipants: null,
        isExternal: true
      },
      {
        id: 'ext-fallback-2',
        name: 'DM Västra Götaland Utomhus',
        description: 'Distriktsmästerskap utomhusbågskytte',
        startDate: '2025-09-15',
        endDate: '2025-09-15',
        location: 'Borås',
        category: 'outdoor' as const,
        status: 'upcoming' as const,
        organizer: 'Västra Götalands Bågskytteförbund',
        registrationDeadline: '',
        maxParticipants: null,
        isExternal: true
      }
    ]
    
    return NextResponse.json({
      success: true,
      data: mockCompetitions,
      count: mockCompetitions.length,
      source: 'fallback',
      error: 'External service unavailable (SSL certificate issue), showing sample data',
      lastUpdated: new Date().toISOString()
    })
  }
}
