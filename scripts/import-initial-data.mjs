import { Pool } from 'pg'

console.log('🚀 Importing initial data into optimal schema...')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
})

try {
    // Import clubs data
    console.log('📍 Importing clubs...')

    const sampleClubs = [
        {
            name: 'Borås Bågskyttesällskap',
            description: 'Välkommen till BBS - en av Sveriges största och mest framgångsrika bågskytteklubbar!',
            city: 'Borås',
            address: 'Skaraborgsvägen 100',
            postal_code: '50422',
            phone: '033-123456',
            email: 'info@borasbagskyttar.se',
            website: 'https://borasbagskyttar.se',
            contact_person: 'Anna Andersson',
            latitude: 57.721,
            longitude: 12.9386,
            established_year: 1985,
            member_count: 120,
            membership_fee: '1200 kr/år',
            activities: JSON.stringify(['Utomhusskytte', 'Inomhusskytte', '3D-skytte', 'Tävling']),
            facilities: JSON.stringify(['30m inomhusbana', '90m utomhusbana', 'Träningslokal', 'Förråd']),
            training_times: JSON.stringify([
                { day: 'Måndag', time: '18:00-20:00', type: 'Nybörjare' },
                { day: 'Onsdag', time: '18:00-21:00', type: 'Alla nivåer' },
                { day: 'Lördag', time: '10:00-12:00', type: 'Ungdom' }
            ]),
            image_url: '/uploads/clubs/1756907209080-4vi56o-bbs-logo-300x300.webp',
            image_alt: 'Borås Bågskyttesällskap logotype',
            facebook_url: 'https://facebook.com/borasbagskyttar',
            instagram_url: 'https://instagram.com/borasbagskyttar',
            welcomes_new_members: true,
            is_active: true
        },
        {
            name: 'Göteborg City Bågskytte',
            description: 'Modern bågskytteklubb i hjärtat av Göteborg med fokus på precision och gemenskap.',
            city: 'Göteborg',
            address: 'Avenyn 42',
            postal_code: '41136',
            phone: '031-987654',
            email: 'kontakt@gbgbagskyttar.se',
            website: 'https://gbgbagskyttar.se',
            contact_person: 'Erik Eriksson',
            latitude: 57.7089,
            longitude: 11.9746,
            established_year: 1992,
            member_count: 85,
            membership_fee: '1500 kr/år',
            activities: JSON.stringify(['Utomhusskytte', 'Inomhusskytte', 'Tävling', 'Instruktion']),
            facilities: JSON.stringify(['25m inomhusbana', '70m utomhusbana', 'Omklädningsrum']),
            training_times: JSON.stringify([
                { day: 'Tisdag', time: '17:30-19:30', type: 'Alla nivåer' },
                { day: 'Torsdag', time: '18:00-20:00', type: 'Tävling' },
                { day: 'Söndag', time: '09:00-11:00', type: 'Familj' }
            ]),
            welcomes_new_members: true,
            is_active: true
        }
    ]

    for (const club of sampleClubs) {
        await pool.query(`
      INSERT INTO clubs (
        name, description, city, address, postal_code, phone, email, website, 
        contact_person, latitude, longitude, established_year, member_count, 
        membership_fee, activities, facilities, training_times, image_url, 
        image_alt, facebook_url, instagram_url, welcomes_new_members, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
      )
    `, [
            club.name, club.description, club.city, club.address, club.postal_code,
            club.phone, club.email, club.website, club.contact_person, club.latitude,
            club.longitude, club.established_year, club.member_count, club.membership_fee,
            club.activities, club.facilities, club.training_times, club.image_url,
            club.image_alt, club.facebook_url, club.instagram_url, club.welcomes_new_members, club.is_active
        ])
        console.log(`✅ Imported club: ${club.name}`)
    }

    // Import news articles
    console.log('📰 Importing news articles...')

    const sampleNews = [
        {
            title: 'Välkommen till den nya VGBF-hemsidan!',
            slug: 'valkomna-nya-hemsidan',
            excerpt: 'Vi är glada att presentera vår moderniserade hemsida med förbättrad användarupplevelse och nya funktioner.',
            content: `
        <p>Efter månader av hårt arbete är vi stolta över att lansera vår helt nya hemsida!</p>
        
        <h2>Nya funktioner</h2>
        <ul>
          <li>📱 Mobilanpassad design som fungerar perfekt på alla enheter</li>
          <li>🗓️ Integrerad kalender för alla evenemang</li>
          <li>🏆 Uppdaterade distriktsrekord med sökfunktion</li>
          <li>📍 Interaktiv karta över alla klubbar i Västra Götaland</li>
          <li>⚡ Snabbare laddningstider och bättre prestanda</li>
        </ul>
        
        <h2>Vad är nytt?</h2>
        <p>Den nya hemsidan är byggd med modern teknik som gör den snabbare, säkrare och enklare att använda. Vi har även förbättrat administrationsverktygen så att vi kan uppdatera innehållet snabbare och mer effektivt.</p>
        
        <p>Har du synpunkter eller förslag? Kontakta oss gärna!</p>
      `,
            author: 'VGBF Styrelsen',
            published_date: '2025-09-07',
            category: 'Allmänt',
            tags: JSON.stringify(['hemsida', 'uppdatering', 'teknik']),
            image_url: '/uploads/news/1756903001115-j92d9m-roadtrip.png',
            image_alt: 'Skärmbild av den nya hemsidan',
            is_published: true,
            is_featured: true,
            view_count: 0
        },
        {
            title: 'Distriktstävling i 3D-skytte',
            slug: 'distrikstavling-3d-skytte',
            excerpt: 'Anmälan öppen för årets största 3D-tävling i Västra Götaland. Välkommen till en helg full av utmaningar i naturskön miljö!',
            content: `
        <p>Vi bjuder in till årets mest efterlängtade 3D-tävling som arrangeras i de vackra skogarna utanför Borås.</p>
        
        <h2>Tävlingsinfo</h2>
        <ul>
          <li><strong>Datum:</strong> 15-16 oktober 2025</li>
          <li><strong>Plats:</strong> Rydals Bågskyttegård</li>
          <li><strong>Anmälan senast:</strong> 1 oktober</li>
          <li><strong>Deltagaravgift:</strong> 250 kr</li>
        </ul>
        
        <h2>Klasser</h2>
        <p>Tävlingen är öppen för alla klasser:</p>
        <ul>
          <li>Instinktiv</li>
          <li>Barebow</li>
          <li>Recurve</li>
          <li>Compound</li>
          <li>Ungdom (under 18 år)</li>
        </ul>
        
        <p>Mer information och anmälan på vår tävlingssida.</p>
      `,
            author: 'Maria Larsson',
            published_date: '2025-09-05',
            category: 'Tävling',
            tags: JSON.stringify(['3D', 'tävling', 'Borås', 'anmälan']),
            is_published: true,
            is_featured: true,
            view_count: 0
        }
    ]

    for (const article of sampleNews) {
        await pool.query(`
      INSERT INTO news_articles (
        title, slug, excerpt, content, author, published_date, category, 
        tags, image_url, image_alt, is_published, is_featured, view_count
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
    `, [
            article.title, article.slug, article.excerpt, article.content, article.author,
            article.published_date, article.category, article.tags, article.image_url,
            article.image_alt, article.is_published, article.is_featured, article.view_count
        ])
        console.log(`✅ Imported news: ${article.title}`)
    }

    // Import board members
    console.log('👥 Importing board members...')

    const boardMembers = [
        {
            name: 'Lars Persson',
            position: 'Ordförande',
            email: 'ordforande@vgbf.se',
            phone: '070-1234567',
            bio: 'Erfaren bågskytt med över 20 års erfarenhet. Har lett VGBF sedan 2020.',
            display_order: 1,
            category: 'board',
            is_active: true,
            term_start: '2024-01-01',
            term_end: '2025-12-31'
        },
        {
            name: 'Anna Johansson',
            position: 'Vice ordförande',
            email: 'vice@vgbf.se',
            phone: '070-2345678',
            bio: 'Aktiv tävlingsskytt och instruktör. Ansvarig för utbildningsfrågor.',
            display_order: 2,
            category: 'board',
            is_active: true,
            term_start: '2024-01-01',
            term_end: '2025-12-31'
        },
        {
            name: 'Erik Nilsson',
            position: 'Kassör',
            email: 'kassor@vgbf.se',
            bio: 'Hanterar förbundets ekonomi och sponsoravtal.',
            display_order: 3,
            category: 'board',
            is_active: true,
            term_start: '2024-01-01',
            term_end: '2025-12-31'
        }
    ]

    for (const member of boardMembers) {
        await pool.query(`
      INSERT INTO board_members (
        name, position, email, phone, bio, display_order, category, 
        is_active, term_start, term_end
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
    `, [
            member.name, member.position, member.email, member.phone, member.bio,
            member.display_order, member.category, member.is_active, member.term_start, member.term_end
        ])
        console.log(`✅ Imported board member: ${member.name} (${member.position})`)
    }

    // Import sponsors
    console.log('🤝 Importing sponsors...')

    const sponsors = [
        {
            name: 'Consid',
            description: 'Teknikkonsult och systemutvecklare som stödjer svensk bågskyttesport.',
            website_url: 'https://consid.se',
            logo_url: '/uploads/sponsors/1756975495715-5rsvt4-consid-se-logo-2.png',
            logo_alt: 'Consid logotype',
            contact_email: 'info@consid.se',
            priority: 1,
            sponsorship_level: 'platinum',
            contract_start: '2025-01-01',
            contract_end: '2025-12-31',
            is_active: true
        }
    ]

    for (const sponsor of sponsors) {
        await pool.query(`
      INSERT INTO sponsors (
        name, description, website_url, logo_url, logo_alt, contact_email,
        priority, sponsorship_level, contract_start, contract_end, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      )
    `, [
            sponsor.name, sponsor.description, sponsor.website_url, sponsor.logo_url,
            sponsor.logo_alt, sponsor.contact_email, sponsor.priority, sponsor.sponsorship_level,
            sponsor.contract_start, sponsor.contract_end, sponsor.is_active
        ])
        console.log(`✅ Imported sponsor: ${sponsor.name}`)
    }

    await pool.end()

    console.log('')
    console.log('🎉 INITIAL DATA IMPORT COMPLETED!')
    console.log('')
    console.log('📊 Summary:')
    console.log('   • 2 clubs imported')
    console.log('   • 2 news articles imported')
    console.log('   • 3 board members imported')
    console.log('   • 1 sponsor imported')
    console.log('')
    console.log('✨ Your database is now populated with sample data!')

} catch (error) {
    console.error('❌ Error importing data:', error)
    process.exit(1)
}
