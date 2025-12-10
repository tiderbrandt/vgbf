import { getAllNews } from '@/lib/news-storage-postgres'

export async function GET() {
  const news = await getAllNews()
  const baseUrl = 'https://vgbf.vercel.app'

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Västra Götalands Bågskytteförbund</title>
    <link>${baseUrl}</link>
    <description>Nyheter från Västra Götalands Bågskytteförbund</description>
    <language>sv-se</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${news
      .map((article) => {
        return `
      <item>
        <title><![CDATA[${article.title}]]></title>
        <link>${baseUrl}/nyheter/${article.slug}</link>
        <guid>${baseUrl}/nyheter/${article.slug}</guid>
        <pubDate>${new Date(article.date).toUTCString()}</pubDate>
        <description><![CDATA[${article.excerpt}]]></description>
      </item>`
      })
      .join('')}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}
