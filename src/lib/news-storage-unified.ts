import { NewsArticle } from '@/types'
import { StorageFactory } from './storage'

// Create storage instance using factory pattern
const newsStorage = StorageFactory.createAuto<NewsArticle>('news.json')

// Default news data - imported from existing implementation
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

**Kostnad:** 1200 kr inkluderar:
- Övernatting
- Måltider
- Träningsmaterial

Anmälan senast 1 november till info@borasbas.se

Vi ses där!`,
    date: '2024-10-15',
    author: 'Borås Bågskyttesällskap',
    slug: 'tjejhelg-med-lina-bjorklund',
    featured: true,
    tags: ['Träning', 'Workshop', 'Tjej']
  },
  {
    id: '3',
    title: 'VGBF:s årsmöte 2024',
    excerpt: 'Inbjudan till VGBF:s årsmöte som äger rum lördag 16 mars kl 10:00 på Friskis & Svettis i Göteborg.',
    content: `Härmed inbjuds alla klubbar till VGBF:s årsmöte 2024.

**Tid:** Lördag 16 mars 2024, kl 10:00
**Plats:** Friskis & Svettis, Gibraltargatan 7, Göteborg

**Preliminär dagordning:**
1. Mötets öppnande
2. Val av mötesordförande
3. Val av mötessekreterare
4. Godkännande av kallelse
5. Verksamhetsberättelse 2023
6. Ekonomisk berättelse 2023
7. Revisionsberättelse
8. Fastställande av balans- och resultaträkning
9. Ansvarsfrihet för styrelsen
10. Verksamhetsplan 2024
11. Budget 2024
12. Val av styrelse
13. Val av revisorer
14. Övriga frågor

Förslag till årsmötet ska vara kansliet tillhanda senast 1 februari.

Med vänliga hälsningar,
VGBF Styrelsen`,
    date: '2024-01-15',
    author: 'VGBF',
    slug: 'arsmote-2024',
    featured: false,
    tags: ['Årsmöte', 'Organisation']
  },
  {
    id: '4',
    title: 'Svenska Bågskytteförbundets nya regler',
    excerpt: 'Svenska Bågskytteförbundet har uppdaterat reglerna för tävlingsverksamhet. Här är de viktigaste förändringarna.',
    content: `Svenska Bågskytteförbundet har beslutat om några viktiga regelförändringar som träder i kraft 1 januari 2024.

**Viktigaste förändringarna:**

**1. Utrustningsregler**
- Nya bestämmelser för stabiliserare
- Uppdaterade regler för sikte
- Förtydliganden kring pilfröjd

**2. Tävlingsformat**
- Rankingrundsförändringar
- Nya utslagningsformat
- Tidsbegränsningar

**3. Klassindelning**
- Nya åldersklasser för juniorer
- Förändringar i veteranklasser
- Uppdaterad funktionsvariationsklassificering

**Viktigt att notera:**
Alla klubbar uppmanas att noggrant läsa igenom de nya reglerna och informera sina medlemmar. Regelverket finns tillgängligt på Svenska Bågskytteförbundets hemsida.

För frågor, kontakta VGBF:s regelansvarige.

VGBF Styrelsen`,
    date: '2023-12-01',
    author: 'VGBF',
    slug: 'nya-regler-2024',
    featured: false,
    tags: ['Regler', 'Tävling', 'SBF']
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

// Public API functions

/**
 * Get all news articles
 */
export async function getAllNews(): Promise<NewsArticle[]> {
  return await initializeNewsData()
}

/**
 * Get news article by ID
 */
export async function getNewsById(id: string): Promise<NewsArticle | undefined> {
  return await newsStorage.findOne(article => article.id === id)
}

/**
 * Get news article by slug
 */
export async function getNewsBySlug(slug: string): Promise<NewsArticle | undefined> {
  return await newsStorage.findOne(article => article.slug === slug)
}

/**
 * Add a new news article
 */
export async function addNews(newsData: Omit<NewsArticle, 'id'>): Promise<NewsArticle> {
  const newArticle: NewsArticle = {
    ...newsData,
    id: Date.now().toString()
  }
  
  return await newsStorage.add(newArticle)
}

/**
 * Update an existing news article
 */
export async function updateNews(id: string, newsData: Partial<NewsArticle>): Promise<NewsArticle | null> {
  return await newsStorage.update(article => article.id === id, newsData)
}

/**
 * Delete a news article
 */
export async function deleteNews(id: string): Promise<boolean> {
  return await newsStorage.delete(article => article.id === id)
}

/**
 * Get featured news articles
 */
export async function getFeaturedNews(): Promise<NewsArticle[]> {
  const articles = await getAllNews()
  return articles.filter(article => article.featured)
}

/**
 * Get recent news articles
 */
export async function getRecentNews(limit: number = 5): Promise<NewsArticle[]> {
  const articles = await getAllNews()
  return articles
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

/**
 * Search news articles by title, content, or tags
 */
export async function searchNews(query: string): Promise<NewsArticle[]> {
  const articles = await getAllNews()
  const searchTerm = query.toLowerCase()
  
  return articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm) ||
    article.content.toLowerCase().includes(searchTerm) ||
    article.excerpt.toLowerCase().includes(searchTerm) ||
    article.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    article.author?.toLowerCase().includes(searchTerm)
  )
}

/**
 * Get news articles by tag
 */
export async function getNewsByTag(tag: string): Promise<NewsArticle[]> {
  const articles = await getAllNews()
  return articles.filter(article => 
    article.tags?.some(articleTag => articleTag.toLowerCase() === tag.toLowerCase())
  )
}

/**
 * Get news articles by author
 */
export async function getNewsByAuthor(author: string): Promise<NewsArticle[]> {
  const articles = await getAllNews()
  return articles.filter(article => 
    article.author?.toLowerCase().includes(author.toLowerCase())
  )
}

/**
 * Get news articles by date range
 */
export async function getNewsByDateRange(startDate: string, endDate: string): Promise<NewsArticle[]> {
  const articles = await getAllNews()
  return articles.filter(article => {
    const articleDate = new Date(article.date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return articleDate >= start && articleDate <= end
  })
}
