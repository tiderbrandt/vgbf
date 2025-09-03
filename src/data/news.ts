import { NewsArticle } from '@/types'

// Sample news data - in a real app, this would come from a database or CMS
export const newsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'NUM subventioneras av VGBF',
    excerpt: 'En vänlig påminnelse! Alla klubbar i VGBF fick ett mail den 22 maj med text enligt nedan! 1. Deltaga...',
    content: `En vänlig påminnelse!

Alla klubbar i VGBF fick ett mail den 22 maj med text enligt nedan!

1. Deltagande i NUM (Nationella ungdomsmästerskapet) subventioneras av VGBF med 500 kr per deltagare.
2. Ansökan ska skickas till distriktet senast 2 veckor före tävlingen.
3. Faktura eller kvitto ska bifogas ansökan.
4. Maximal subvention per klubb är 5000 kr per år.

För mer information kontakta styrelsen på VastraGotalandsBF@bagskytte.se`,
    date: '2025-08-20',
    author: 'VGBF Styrelsen',
    slug: 'num-subventioneras-av-vgbf',
    featured: true,
    tags: ['NUM', 'Subvention', 'Ungdom']
  },
  {
    id: '2',
    title: 'Tjejhelg med Lina Björklund',
    excerpt: 'När: 23-24 november Var: Borås Bågskyttesällskap',
    content: `Vi är glada att kunna meddela att Lina Björklund kommer att hålla en tjejhelg hos Borås Bågskyttesällskap!

**När:** 23-24 november 2024
**Var:** Borås Bågskyttesällskap

Under helgen kommer deltagarna att få:
- Teknisk träning med Lina
- Mentala träningspass
- Gemenskap och erfarenhetsutbyte
- Gemensamma måltider

Anmälan sker via klubben. Begränsat antal platser!

För mer information kontakta Borås Bågskyttesällskap eller VGBF.`,
    date: '2024-11-03',
    author: 'VGBF',
    slug: 'tjejhelg-med-lina-bjorklund',
    featured: false,
    tags: ['Tjejhelg', 'Träning', 'Borås']
  },
  {
    id: '3',
    title: 'DM tävlingar för 2024',
    excerpt: 'Alla DM tävlingar för 2024 har nu arrangörer.',
    content: `Vi är glada att meddela att alla DM tävlingar för 2024 nu har arrangörer!

**Fastställda DM tävlingar 2024:**
- DM Fält: Arrangör bestäms
- DM Tavla inomhus: Arrangör bestäms  
- DM Tavla utomhus: Arrangör bestäms
- DM 3D: Arrangör bestäms

Mer detaljerad information om datum, platser och anmälan kommer att publiceras på vår hemsida och i separata utskick.

Tack till alla klubbar som ställt upp som arrangörer!`,
    date: '2024-04-01',
    author: 'VGBF Tävlingskommittén',
    slug: 'dm-tavlingar-for-2024',
    featured: false,
    tags: ['DM', 'Tävlingar', '2024']
  },
  {
    id: '4',
    title: 'Domarkurs i Borås 17-18/2 2024',
    excerpt: 'Domarkurs genomfördes i Borås lördag och söndag 17-18/2. Det blev 15 deltagare från 6 klubbar.',
    content: `Domarkurs genomfördes i Borås lördag och söndag 17-18/2.

**Resultat:**
- 15 deltagare från 6 klubbar
- Lyckad genomgång av alla moment
- Alla deltagare godkända

**Klubbar som deltog:**
- Borås Bågskyttesällskap
- Göteborg BSK
- Trollhättans BSK
- Uddevalla BSK
- Alingsås BSK
- Vårgårda BSK

Tack till alla deltagare och instruktörer för en välgenomförd kurs!

Nästa domarkurs planeras till hösten 2024.`,
    date: '2024-02-22',
    author: 'VGBF Utbildningskommittén',
    slug: 'domarkurs-i-boras-17-18-2-2024',
    featured: false,
    tags: ['Domarkurs', 'Utbildning', 'Borås']
  },
  {
    id: '5',
    title: 'Årsmöte 2025 - Kallelse',
    excerpt: 'Västra Götalands Bågskytteförbunds årsmöte 2025 kommer att hållas den 15 mars.',
    content: `Härmed kallas till Västra Götalands Bågskytteförbunds årsmöte 2025.

**Datum:** Lördag 15 mars 2025
**Tid:** 10:00
**Plats:** Meddelas senare

**Preliminär dagordning:**
1. Mötets öppnande
2. Val av mötesordförande och sekreterare
3. Fastställande av röstlängd
4. Fastställande av dagordning
5. Styrelsens verksamhetsberättelse
6. Styrelsens ekonomiska berättelse
7. Revisorernas berättelse
8. Ansvarsfrihet för styrelsen
9. Fastställande av verksamhetsplan
10. Fastställande av budget
11. Fastställande av avgifter
12. Val av styrelse
13. Val av revisorer
14. Övriga frågor

Motioner ska vara styrelsen tillhanda senast 15 februari 2025.

Välkomna!`,
    date: '2025-01-15',
    author: 'VGBF Styrelsen',
    slug: 'arsmote-2025-kallelse',
    featured: true,
    tags: ['Årsmöte', 'Kallelse', '2025']
  }
]

// Utility functions for news management
export function getAllNews(): NewsArticle[] {
  return newsArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getFeaturedNews(): NewsArticle[] {
  return newsArticles
    .filter(article => article.featured)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getRecentNews(limit: number = 4): NewsArticle[] {
  return getAllNews().slice(0, limit)
}

export function getNewsBySlug(slug: string): NewsArticle | undefined {
  return newsArticles.find(article => article.slug === slug)
}

export function getNewsById(id: string): NewsArticle | undefined {
  return newsArticles.find(article => article.id === id)
}

export function getNewsByTag(tag: string): NewsArticle[] {
  return newsArticles
    .filter(article => article.tags?.includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
