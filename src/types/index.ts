export interface NewsArticle {
  id: string
  title: string
  excerpt: string
  content: string
  date: string
  author?: string
  slug: string
  featured?: boolean
  imageUrl?: string
  imageAlt?: string
  tags?: string[]
}

export interface ExternalNewsItem {
  id: string
  title: string
  excerpt: string
  url: string
  date: string
  source: string
}

export interface Competition {
  id: string
  title: string
  description: string
  date: string
  location: string
  registrationDeadline: string
  maxParticipants?: number
  currentParticipants?: number
  category: 'outdoor' | 'indoor' | '3d' | 'field' | 'other'
  status: 'upcoming' | 'ongoing' | 'completed'
  organizer: string
  contactEmail: string
  registrationUrl?: string
  resultsUrl?: string
  imageUrl?: string
  imageAlt?: string
  fee?: string
  equipment?: string[]
  rules?: string
  isExternal?: boolean // For external competitions from other sources
  endDate?: string // For multi-day competitions
}

export interface DistrictRecord {
  id: string
  category: string // e.g., "Utomhus SBF 70m/60m/50m/40m/30m 72/15 pilar", "Inomhus SBF 18m/12m 15 pilar"
  class: string // e.g., "Herrar Recurve", "Damer Compound", "U21 Herrar Barebow"
  name: string
  club: string
  score: string // e.g., "675", "589/600"
  date: string // ISO date string
  competition: string
  competitionUrl?: string // Link to resultat.bagskytte.se
  organizer: string
  notes?: string
}

export interface Club {
  id: string
  name: string
  description: string
  location: string
  contactPerson?: string
  email: string
  phone?: string
  website?: string
  address?: string
  postalCode?: string
  city: string
  established?: string
  activities: string[]
  facilities?: string[]
  trainingTimes?: {
    day: string
    time: string
    type?: string
  }[]
  imageUrl?: string
  imageAlt?: string
  facebook?: string
  instagram?: string
  memberCount?: number
  membershipFee?: string
  welcomesNewMembers: boolean
}

export interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string
  endDate?: string
  time: string
  endTime?: string
  location?: string
  type: 'competition' | 'meeting' | 'training' | 'course' | 'social' | 'other'
  organizer?: string
  contactEmail?: string
  registrationRequired: boolean
  registrationUrl?: string
  maxParticipants?: number
  currentParticipants?: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface Sponsor {
  id: string
  name: string
  description?: string
  website?: string
  logoUrl?: string
  logoAlt?: string
  priority: number // For ordering sponsors (lower = higher priority)
  isActive: boolean
  addedDate: string
  updatedAt: string
}

export interface BoardMember {
  id: string
  title: string // e.g., "Ordförande", "Sekreterare", "Kassör", "Ordinarie ledamot"
  name: string
  club: string
  email?: string
  phone?: string
  description: string
  order: number // For display ordering
  category: 'board' | 'substitute' | 'auditor' | 'nomination' // Which section they belong to
  isActive: boolean
  addedDate: string
  updatedAt: string
}

export interface BoardData {
  boardMembers: BoardMember[]
  substitutes: BoardMember[]
  auditors: BoardMember[]
  nominationCommittee: BoardMember[]
  lastUpdated: string
  meetingInfo?: {
    description: string
    contactInfo: string
  }
}
