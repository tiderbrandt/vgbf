# Västra Götalands Bågskytteförbund (VGBF) Website

Modern, responsive website for Västra Götalands Bågskytteförbund built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🏹 Modern and responsive design
- 📱 Mobile-first approach
- ⚡ Fast performance with Next.js
- 🎨 Custom VGBF branding and colors
- 📰 Dynamic news system with full CRUD operations
- 🏆 Competitions section (upcoming and completed)
- 🏢 Contact information and footer
- 🔗 Links to external resources
- 📝 Admin interface for news management
- 🏷️ News tagging and categorization

## Tech Stack

- **Framework**: Next.js 14.2.32
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Development**: ESLint for code quality

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd vgbf
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/
│   ├── admin/
│   │   └── page.tsx         # News admin interface
│   ├── api/
│   │   └── news/
│   │       ├── route.ts     # News API endpoints
│   │       └── [slug]/
│   │           └── route.ts # Individual news API
│   ├── nyheter/
│   │   ├── page.tsx         # News listing page
│   │   └── [slug]/
│   │       └── page.tsx     # Individual news article
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── admin/
│   │   └── NewsForm.tsx     # News creation/editing form
│   ├── Header.tsx           # Navigation header
│   ├── Hero.tsx             # Hero section
│   ├── NewsSection.tsx      # News display
│   ├── CompetitionsSection.tsx # Competitions
│   └── Footer.tsx           # Site footer
├── data/
│   └── news.ts              # News data and utilities
└── types/
    └── index.ts             # TypeScript type definitions
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with automatic builds on push

### Manual Build

```bash
npm run build
npm run start
```

## News Management

The website includes a complete news management system:

### Features

- **Dynamic News Loading**: News articles are loaded from a centralized data source
- **Individual Article Pages**: Each news article has its own dedicated page
- **Admin Interface**: Simple admin panel for managing news articles
- **Tagging System**: Categorize news with tags
- **Featured Articles**: Mark important news as featured
- **API Endpoints**: RESTful API for news operations

### Usage

#### Viewing News

- **Homepage**: Shows 4 most recent news articles
- **News Page**: `/nyheter` - Shows all news articles in a grid layout
- **Individual Articles**: `/nyheter/[slug]` - Full article view

#### Managing News (Admin)

- **Admin Panel**: `/admin` - Simple interface for news management
- **Add News**: Click "Lägg till nyhet" to create new articles
- **Edit News**: Click "Redigera" on any article in the admin table
- **Delete News**: Click "Ta bort" to remove articles

#### API Endpoints

- `GET /api/news` - Get all news articles
- `GET /api/news?type=featured` - Get featured articles only
- `GET /api/news?type=recent&limit=4` - Get recent articles with limit
- `GET /api/news/[slug]` - Get specific article by slug

### Data Structure

News articles include:

- **title**: Article headline
- **excerpt**: Short summary for previews
- **content**: Full article content
- **date**: Publication date
- **author**: Article author (optional)
- **slug**: URL-friendly identifier
- **featured**: Whether article is marked as important
- **tags**: Array of category tags

### Adding New News Articles

1. Navigate to `/admin`
2. Click "Lägg till nyhet"
3. Fill in the form:
   - **Rubrik**: Article title (required)
   - **Utdrag**: Short excerpt for previews (required)
   - **Innehåll**: Full article content (required)
   - **Författare**: Author name (optional)
   - **Taggar**: Comma-separated tags (optional)
   - **Markera som viktig**: Check to feature the article
4. Click "Lägg till" to save

The system automatically generates:

- **slug**: URL-friendly version of the title
- **date**: Current date
- **id**: Unique identifier

### Customization

To modify the news system:

- **Data Source**: Edit `src/data/news.ts` to change default articles
- **Styling**: Modify components in `src/components/`
- **API Logic**: Update `src/app/api/news/` for custom endpoints
- **Admin Interface**: Customize `src/app/admin/page.tsx`

## Customization

### Colors

Custom VGBF colors are defined in `tailwind.config.js`:

- `vgbf-blue`: #003366 (primary)
- `vgbf-gold`: #FFD700 (accent)
- `vgbf-green`: #006633 (secondary)

## Content Management

### News System

- **Storage**: JSON file (`data/news.json`)
- **Admin Interface**: Visit `/admin` to manage articles
- **Features**: Add, edit, delete, tag articles, mark as featured
- **API**: RESTful endpoints for all operations
- **Persistence**: All changes saved automatically

See [NEWS_STORAGE.md](./NEWS_STORAGE.md) for detailed documentation.

### Content Updates

- News articles: Use admin interface at `/admin`
- Competitions: Modify the `competitions` array in `CompetitionsSection.tsx`
- Contact info: Edit contact details in `Footer.tsx`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

Västra Götalands Bågskytteförbund

- Email: VastraGotalandsBF@bagskytte.se
- Phone: 0705 46 34 66
- Website: [VGBF Official](https://www.bagskytte.se/vastra-gotalands-bagskytteforbund)
