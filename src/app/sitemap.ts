import { MetadataRoute } from 'next'
import { getAllNews } from '@/lib/news-storage-postgres'
import { getAllClubs } from '@/lib/clubs-storage-postgres'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://vgbf.vercel.app'

  // Static routes
  const routes = [
    '',
    '/nyheter',
    '/tavlingar',
    '/tavlingar/kommande',
    '/tavlingar/avslutade',
    '/klubbar',
    '/distriktsrekord',
    '/styrelsen',
    '/kontakt',
    '/kalender',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Dynamic routes: News
  const news = await getAllNews()
  const newsRoutes = news.map((article) => ({
    url: `${baseUrl}/nyheter/${article.slug}`,
    lastModified: new Date(article.date),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Dynamic routes: Clubs
  const clubs = await getAllClubs()
  const clubRoutes = clubs.map((club) => ({
    url: `${baseUrl}/klubbar/${club.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...routes, ...newsRoutes, ...clubRoutes]
}
