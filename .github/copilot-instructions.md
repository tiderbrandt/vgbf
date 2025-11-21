<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# VGBF Project - GitHub Copilot Instructions

## Project Overview

**Västra Götalands Bågskytteförbund (VGBF)** - A production-ready archery federation website built with modern web technologies.

- **Status**: ✅ Live in Production at [vgbf.vercel.app](https://vgbf.vercel.app)
- **Purpose**: Archery federation website with news, events, competitions, clubs, and admin management
- **Repository**: https://github.com/tiderbrandt/vgbf

## Tech Stack & Architecture

### Core Technologies
- **Framework**: Next.js 14.2.32 (App Router with Server Components)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS with custom VGBF design system
- **Database**: PostgreSQL (Neon serverless in production)
- **Storage**: Vercel Blob for image uploads
- **Deployment**: Vercel with automatic deployments
- **Authentication**: JWT-based admin authentication

### Key Design Principles
1. **Server-First**: Prefer React Server Components over Client Components
2. **Type Safety**: Always use TypeScript with proper typing
3. **Performance**: Optimize images, cache API calls, use database connection pooling
4. **Security**: SQL injection protection, XSS prevention, secure JWT handling
5. **Mobile-First**: Responsive design with Tailwind breakpoints

## Project Structure

```
/src
├── app/                    # Next.js App Router pages & API routes
│   ├── admin/             # Admin dashboard & management interfaces
│   ├── api/               # API endpoints (news, calendar, clubs, etc.)
│   ├── calendar/          # Event calendar pages
│   ├── clubs/             # Club directory & profiles
│   ├── competitions/      # Competition listings
│   └── records/           # District records
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── calendar/         # Calendar components
│   └── ...               # Other feature components
├── lib/                  # Utility functions & database
│   ├── db.ts            # PostgreSQL connection & queries
│   └── ...              # Other utilities
└── types/               # TypeScript type definitions

/docs                    # Project documentation (organized by category)
/database               # SQL schemas & migration scripts
/scripts                # Deployment & setup scripts
/data                   # JSON data files (legacy/backup)
```

## Coding Standards

### TypeScript Guidelines
- Always define proper types and interfaces
- Avoid `any` type - use `unknown` if type is truly unknown
- Use type imports: `import type { ... }`
- Export types alongside components when needed

### React Component Guidelines
- **Server Components by default** - only use Client Components when needed:
  - User interactions (onClick, onChange, etc.)
  - Browser APIs (localStorage, window)
  - React hooks (useState, useEffect)
- Use proper error boundaries and Suspense boundaries
- Implement loading states for async operations
- Handle errors gracefully with user-friendly messages

### Database & API Guidelines
- **Always use parameterized queries** to prevent SQL injection
- Use connection pooling (already configured in `lib/db.ts`)
- Handle database errors gracefully
- Return proper HTTP status codes from API routes
- Validate all input data on the server side
- Use proper TypeScript types for API responses

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use VGBF color palette:
  - Primary (Blue): `#003366` / `bg-vgbf-blue`
  - Secondary (Green): `#006633` / `bg-vgbf-green`
- Maintain consistent spacing using Tailwind's spacing scale
- Use semantic HTML elements

## Common Patterns

### Database Queries
```typescript
import { query } from '@/lib/db';

// Always use parameterized queries
const result = await query(
  'SELECT * FROM table WHERE id = $1',
  [id]
);
```

### API Route Structure
```typescript
export async function GET(request: Request) {
  try {
    // Validate input
    // Query database
    // Return Response
    return Response.json(data);
  } catch (error) {
    console.error('Error:', error);
    return Response.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}
```

### Admin Authentication
- Check JWT token in API routes using `lib/auth.ts`
- Protect admin routes with middleware
- Always verify user permissions before mutations

## Important Notes

### File Organization
- **Documentation**: All docs in `/docs` directory (organized by category)
- **Scripts**: Setup/deployment scripts in `/scripts`
- **Migrations**: Database scripts in `/database`
- **Tests**: Test files co-located with components in `__tests__` directories

### Environment Variables
Required variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - For admin authentication
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage
- External API keys for RSS feeds, calendars, etc.

### External Integrations
- **RSS Feeds**: External archery news integration
- **ICS Calendar**: External calendar event parsing
- **Competition Data**: Integration with archery competition APIs

## Testing
- Use Jest + React Testing Library
- Test files in `src/__tests__/`
- Run tests: `npm test`
- See `TESTING.md` for detailed testing guidelines

## Deployment
- Automatic deployment to Vercel on push to `main`
- Production URL: https://vgbf.vercel.app
- See `docs/deployment/` for deployment documentation

## When Making Changes

1. **Database Changes**: Create migration scripts in `/database`
2. **New Features**: Update relevant documentation in `/docs`
3. **API Changes**: Ensure backward compatibility or update clients
4. **Type Changes**: Update type definitions in `/src/types`
5. **Admin Features**: Ensure proper authentication checks

## Need Help?
- Check `/docs/README.md` for documentation index
- Review `/docs/troubleshooting/` for common issues
- See `/docs/architecture/` for system design patterns
