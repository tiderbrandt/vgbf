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

export interface Competition {
  id: string
  title: string
  description: string
  date: string
  registrationDeadline?: string
  organizer: string
  location: string
  status: 'upcoming' | 'ongoing' | 'completed'
  category: 'outdoor' | 'indoor' | '3d' | 'field' | 'other'
  maxParticipants?: number
  registrationUrl?: string
  resultsUrl?: string
  contactEmail?: string
  fee?: string
  equipment?: string[]
  rules?: string
  imageUrl?: string
  imageAlt?: string
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
