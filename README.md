# Västra Götalands Bågskytteförbund (VGBF) Website

Modern, responsive website for Västra Götalands Bågskytteförbund built with Next.js, TypeScript, and Tailwind CSS with full database integration.

## 🌟 Current Status

✅ **Production Ready**: Fully deployed at [vgbf.vercel.app](https://vgbf.vercel.app)  
✅ **Database Integration**: PostgreSQL with Neon serverless database  
✅ **Admin System**: Complete content management interface  
✅ **Calendar System**: Full event management with CRUD operations  
✅ **News Management**: Local news + external RSS integration  

## Features

- � **Modern Design**: Responsive, mobile-first approach with custom VGBF branding
- � **Event Calendar**: Complete calendar system with month/list views and admin management
- 📰 **News System**: Local news management + external RSS feed integration
- 🏆 **Competitions**: Upcoming and completed competitions with external data integration
- 👥 **Club Directory**: Searchable directory of member clubs with detailed profiles
- 🏅 **Records System**: District records management with category filtering
- 👨‍💼 **Board Members**: Management board with contact information
- � **Admin Interface**: Complete admin panel for content management
- 🗃️ **Database**: PostgreSQL with Neon serverless for production scalability

## Tech Stack

- **Framework**: Next.js 14.2.32 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom VGBF design system
- **Database**: PostgreSQL with Neon serverless for production
- **Authentication**: JWT-based admin authentication
- **Image Storage**: Vercel Blob for file uploads
- **External APIs**: RSS feed integration, ICS calendar parsing
- **Deployment**: Vercel with automatic deployments from GitHub

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- PostgreSQL database (Neon account for production)

### Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/tiderbrandt/vgbf.git
cd vgbf
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:

```bash
# Database
DATABASE_URL="your-neon-postgres-url"
USE_PG_LOCAL=0

# Admin Authentication
JWT_SECRET="your-jwt-secret"

# Blob Storage (optional)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run test suite (Jest + React Testing Library)

## Project Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── calendar/         # Calendar event management
│   │   ├── clubs/           # Club management
│   │   ├── competitions/    # Competition management
│   │   ├── news/            # News management
│   │   ├── records/         # Records management
│   │   └── page.tsx         # Admin dashboard
│   ├── api/
│   │   ├── auth/            # Authentication endpoints
│   │   ├── calendar/        # Calendar API
│   │   ├── clubs/           # Clubs API
│   │   ├── competitions/    # Competitions API
│   │   ├── news/            # News API
│   │   ├── records/         # Records API
│   │   └── external-*/      # External data integrations
│   ├── kalender/            # Public calendar page
│   ├── klubbar/             # Clubs directory
│   ├── nyheter/             # News pages
│   ├── distriktsrekord/     # Records page
│   ├── tavlingar/           # Competitions page
│   └── page.tsx             # Homepage
├── components/
│   ├── admin/               # Admin interface components
│   ├── ui/                  # Reusable UI components
│   ├── Header.tsx           # Navigation
│   ├── Footer.tsx           # Site footer
│   ├── NextEvent.tsx        # Next event display
│   └── *Section.tsx         # Various content sections
├── lib/
│   ├── *-storage-postgres.ts # Database access layers
│   ├── auth.ts              # Authentication utilities
│   └── db-helper.ts         # Database helper
├── data/                    # Static/seed data
├── types/                   # TypeScript definitions
└── __tests__/              # Test files
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

## Content Management

### Calendar System

Complete event management with public calendar display:

- **Admin Interface**: `/admin/calendar` - Create, edit, delete events
- **Public Calendar**: `/kalender` - Month and list views
- **Event Types**: Competition, course, meeting, social, training, other
- **Features**: Registration tracking, capacity management, public/private events
- **Frontend Integration**: Next event displayed on homepage

### News Management

Dual news system with local content and external RSS integration:

- **Local News**: Full CRUD operations via admin interface
- **External News**: Automatic RSS feed integration from Riksidrottsförbundet  
- **Admin Panel**: `/admin/news` - Manage local news articles
- **API Endpoints**: RESTful endpoints for all news operations
- **Featured Articles**: Highlight important local news

### Clubs Directory

Searchable directory of member clubs:

- **Admin Management**: `/admin/clubs` - Add, edit club information
- **Public Directory**: `/klubbar` - Searchable club listings with filters
- **Features**: Location-based filtering, new member welcome status
- **Club Profiles**: Individual pages for each club with detailed information

### Competitions Management

Competition tracking and display:

- **Admin Interface**: `/admin/competitions` - Manage competition data
- **Public Pages**: `/tavlingar` - Upcoming, ongoing, and completed competitions
- **External Integration**: ICS calendar parsing for external competitions
- **Status Tracking**: Automatic status updates (upcoming → ongoing → completed)

### Records System

District records management:

- **Admin Interface**: `/admin/records` - Manage shooting records
- **Public Display**: `/distriktsrekord` - Category-filtered records display
- **Categories**: Different shooting disciplines and age groups
- **Features**: Record progression tracking, historical data

### Board Members

Management board information:

- **Admin Interface**: `/admin/board` - Manage board member information
- **Public Display**: `/styrelsen` - Board structure and contact information
- **Features**: Role-based organization, contact details

## Database & Authentication

### Database Schema

PostgreSQL database with the following main tables:

- `calendar_events` - Event calendar with CRUD operations
- `clubs` - Member club directory
- `competitions` - Competition tracking and management  
- `news` - Local news articles with tagging
- `records` - District shooting records
- `board_members` - Management board information
- `settings` - Site configuration

### Authentication

JWT-based authentication for admin access:

- **Admin Login**: `/admin` - Secure login with session management
- **Protected Routes**: All admin endpoints require valid JWT token
- **Session Management**: Automatic token renewal and logout handling

### External Integrations

- **RSS Feeds**: Automatic news fetching from Riksidrottsförbundet
- **ICS Calendar**: External competition data parsing
- **Blob Storage**: Image uploads for news, clubs, and other content

## Customization

### Design System

Custom VGBF colors defined in `tailwind.config.js`:

- `vgbf-blue`: #003366 (primary)
- `vgbf-gold`: #FFD700 (accent)  
- `vgbf-green`: #006633 (secondary)

### Content Configuration

- **Homepage Sections**: Modify components in `/src/components/`
- **Navigation**: Update `Header.tsx` for menu changes
- **Footer**: Edit contact info and links in `Footer.tsx`
- **Admin Interface**: Customize admin panels in `/src/app/admin/`

## Development Guidelines

### Code Quality

- **TypeScript**: Full type safety with strict mode enabled
- **ESLint**: Code quality and consistency checking
- **Testing**: Jest + React Testing Library for component testing
- **Error Handling**: Comprehensive error boundaries and API error handling

### Performance

- **Server Components**: Extensive use of React Server Components
- **Image Optimization**: Next.js Image component with Vercel Blob storage
- **Caching**: Strategic caching of external API calls and static content
- **Database**: Optimized queries with connection pooling

### Security

- **SQL Injection Protection**: Parameterized queries and input validation
- **XSS Prevention**: Content sanitization and CSP headers
- **Authentication**: Secure JWT implementation with proper session management
- **CORS**: Proper cross-origin request handling

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
