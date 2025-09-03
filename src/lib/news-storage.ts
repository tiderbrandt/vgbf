import fs from 'fs/promises'
import path from 'path'
import { NewsArticle } from '@/types'

// Path to the JSON file where news will be stored
const NEWS_FILE_PATH = path.join(process.cwd(), 'data', 'news.json')

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(NEWS_FILE_PATH)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Default news data (same as before)
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

// Read news from JSON file
export async function readNewsFromFile(): Promise<NewsArticle[]> {
  try {
    await ensureDataDirectory()
    const data = await fs.readFile(NEWS_FILE_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    // If file doesn't exist or is corrupted, return default data and create file
    console.log('Creating news file with default data...')
    await writeNewsToFile(defaultNewsArticles)
    return defaultNewsArticles
  }
}

// Write news to JSON file
export async function writeNewsToFile(news: NewsArticle[]): Promise<void> {
  try {
    await ensureDataDirectory()
    await fs.writeFile(NEWS_FILE_PATH, JSON.stringify(news, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing news to file:', error)
    throw new Error('Failed to save news data')
  }
}

// Add a new news article
export async function addNews(newsData: Omit<NewsArticle, 'id'>): Promise<NewsArticle> {
  const news = await readNewsFromFile()
  const newArticle: NewsArticle = {
    ...newsData,
    id: Date.now().toString()
  }
  
  news.unshift(newArticle) // Add to beginning
  await writeNewsToFile(news)
  return newArticle
}

// Update an existing news article
export async function updateNews(id: string, newsData: Partial<NewsArticle>): Promise<NewsArticle | null> {
  const news = await readNewsFromFile()
  const index = news.findIndex(article => article.id === id)
  
  if (index === -1) return null
  
  news[index] = { ...news[index], ...newsData }
  await writeNewsToFile(news)
  return news[index]
}

// Delete a news article
export async function deleteNews(id: string): Promise<boolean> {
  const news = await readNewsFromFile()
  const filteredNews = news.filter(article => article.id !== id)
  
  if (filteredNews.length === news.length) return false
  
  await writeNewsToFile(filteredNews)
  return true
}

// Utility functions for news management
export async function getAllNews(): Promise<NewsArticle[]> {
  const news = await readNewsFromFile()
  return news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getFeaturedNews(): Promise<NewsArticle[]> {
  const news = await readNewsFromFile()
  return news
    .filter(article => article.featured)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getRecentNews(limit: number = 4): Promise<NewsArticle[]> {
  const allNews = await getAllNews()
  return allNews.slice(0, limit)
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | undefined> {
  const news = await readNewsFromFile()
  return news.find(article => article.slug === slug)
}

export async function getNewsById(id: string): Promise<NewsArticle | undefined> {
  const news = await readNewsFromFile()
  return news.find(article => article.id === id)
}

export async function getNewsByTag(tag: string): Promise<NewsArticle[]> {
  const news = await readNewsFromFile()
  return news
    .filter(article => article.tags?.includes(tag))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
