import { NewsArticle } from '@/types'
import { BlobStorage } from './blob-storage'

// Initialize blob storage for news
const newsStorage = new BlobStorage<NewsArticle>('data/news.json')

// Default news data
const defaultNewsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'NUM subventioneras av VGBF',
    excerpt: 'En vänlig påminnelse! Alla klubbar i VGBF fick ett mail den 22 maj med text enligt nedan! 1. Deltaga...',
    content: `En vänlig påminnelse!

Alla klubbar i VGBF fick ett mail den 22 maj med text enligt nedan!

1. Deltagande i NUM (Nationella ungdomsmästerskapet) subventioneras av VGBF med 500 kr per deltagare.
2. Ansökan ska skickas till distriktet senast 2 veckor före tävlingen.
3. Faktura eller kvitto ska bifogas ansökan.

Ansökan skickas till vgbf.info@gmail.com

Tack för er uppmärksamhet och lycka till med tävlingarna!

VGBF Styrelsen`,
    date: '2024-12-15',
    author: 'VGBF',
    slug: 'num-subventioneras-av-vgbf',
    featured: true,
    tags: ['NUM', 'Subvention', 'Ungdom']
  },
  {
    id: '2',
    title: 'Tjejhelg med Lina Björklund',
    excerpt: 'Borås Bågskyttesällskap arrangerar tjejhelg med Lina Björklund 16-17 november!',
    content: `Vi är glada att meddela att Borås Bågskyttesällskap arrangerar en tjejhelg med Lina Björklund den 16-17 november!

**Program:**
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
    excerpt: 'Lyckad domarkurs genomfördes i Borås med deltagare från flera klubbar.',
    content: `En mycket lyckad domarkurs genomfördes i Borås den 17-18 februari 2024.

**Deltagande klubbar:**
- Borås Bågskyttesällskap
- Göteborg Bågskyttar
- Trollhättan BSK
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
**Plats:** Borås Bågskyttesällskap

**Dagordning:**
1. Mötets öppnande
2. Val av mötesordförande
3. Val av mötessekreterare
4. Godkännande av föredragningslista
5. Fastställande av röstlängd
6. Verksamhetsberättelse
7. Ekonomisk berättelse
8. Revisionsberättelse
9. Ansvarsfrihet
10. Verksamhetsplan
11. Budget
12. Motioner
13. Val
14. Övriga frågor
15. Mötets avslutande

Handlingar kommer att skickas ut senast 2 veckor före mötet.

Välkomna!`,
    date: '2025-01-15',
    author: 'VGBF Styrelsen',
    slug: 'arsmote-2025-kallelse',
    featured: true,
    tags: ['Årsmöte', 'Kallelse', '2025']
  }
]

// Initialize news data if not exists
async function initializeNewsData(): Promise<NewsArticle[]> {
  const existingNews = await newsStorage.read()
  if (existingNews.length === 0) {
    console.log('Initializing news data with defaults...')
    await newsStorage.write(defaultNewsArticles)
    return defaultNewsArticles
  }
  return existingNews
}

// Get all news articles
export async function getAllNews(): Promise<NewsArticle[]> {
  const news = await initializeNewsData()
  return news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Add a new news article
export async function addNews(newsData: Omit<NewsArticle, 'id'>): Promise<NewsArticle> {
  const newArticle: NewsArticle = {
    ...newsData,
    id: Date.now().toString()
  }
  
  await newsStorage.add(newArticle)
  return newArticle
}

// Update an existing news article
export async function updateNews(id: string, newsData: Partial<NewsArticle>): Promise<NewsArticle | null> {
  return await newsStorage.update(
    (article) => article.id === id,
    newsData
  )
}

// Delete a news article
export async function deleteNews(id: string): Promise<boolean> {
  return await newsStorage.delete((article) => article.id === id)
}

// Get featured news
export async function getFeaturedNews(): Promise<NewsArticle[]> {
  const news = await getAllNews()
  return news
    .filter(article => article.featured)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getRecentNews(limit: number = 4): Promise<NewsArticle[]> {
  const allNews = await getAllNews()
  return allNews.slice(0, limit)
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | undefined> {
  return await newsStorage.findOne(article => article.slug === slug)
}

export async function getNewsById(id: string): Promise<NewsArticle | undefined> {
  return await newsStorage.findOne(article => article.id === id)
}

export async function getNewsByTag(tag: string): Promise<NewsArticle[]> {
  const news = await newsStorage.findMany(article => article.tags?.includes(tag) ?? false)
  return news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
