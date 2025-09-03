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
