# VGBF - Coding Agent Instructions

**Repository**: Production archery federation website at [vgbf.vercel.app](https://vgbf.vercel.app)  
**Stack**: Next.js 14.2.32 (App Router) + TypeScript + PostgreSQL (Neon) + Tailwind CSS  
**Size**: ~50 pages, ~200 components, ~3,000 files (including node_modules)

## Quick Start & Build Commands

```bash
# Install dependencies (Node.js 18+)
npm install

# Development server (localhost:3000)
npm run dev

# Production build (MUST pass before deployment)
npm run build

# Tests (Jest + React Testing Library)
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
npm run test:api           # API tests only

# Lint (MUST pass)
npm run lint
```

**Critical**: `npm run build` MUST succeed before any PR. Next.js build errors are common - see troubleshooting below.

## Environment Variables Required

```bash
# .env.local (required for local development)
DATABASE_URL="postgresql://..." # Neon PostgreSQL connection string
JWT_SECRET="..."                # Admin authentication
BLOB_READ_WRITE_TOKEN="..."    # Vercel Blob (optional)
USE_PG_LOCAL=0                  # 0=Neon (default), 1=local pg
```

**Production** (Vercel): Set in Vercel dashboard → Settings → Environment Variables

## Architecture & Key Patterns

### 1. Database Access Pattern (CRITICAL)
**Always use the storage layer pattern** - never query database directly in components/routes:

```typescript
// ✅ CORRECT: Use storage layer
import * as newsStorage from '@/lib/news-storage-postgres'
const articles = await newsStorage.getAllNews()

// ❌ WRONG: Direct database queries
import { sql } from '@/lib/database'
const result = await sql`SELECT * FROM news`
```

**Storage files**: `src/lib/*-storage-postgres.ts` (news, clubs, calendar, competitions, records, etc.)  
**Database helper**: `src/lib/database.ts` exports `sql` tagged template function

### 2. API Route Pattern

```typescript
// src/app/api/[resource]/route.ts
export async function GET(request: NextRequest) {
  try {
    const data = await storage.getAll() // Use storage layer
    return Response.json(data)
  } catch (error) {
    console.error('Error:', error)
    return Response.json({ error: 'Message' }, { status: 500 })
  }
}

// DELETE/PUT require auth check
export async function DELETE(request: NextRequest) {
  const authError = await verifyAdmin(request)
  if (authError) return authError
  // ... rest of logic
}
```

### 3. Component Types (Server vs Client)

**Default to Server Components**. Only add `'use client'` when:
- Using React hooks (useState, useEffect, useContext)
- Handling browser events (onClick, onChange)
- Using browser APIs (window, localStorage)

```typescript
// ✅ Server Component (default)
export default async function Page() {
  const data = await storage.getData() // Direct async
  return <div>{data}</div>
}

// ✅ Client Component (when needed)
'use client'
import { useState } from 'react'
export default function Interactive() {
  const [state, setState] = useState()
  return <button onClick={() => setState()}>Click</button>
}
```

### 4. TypeScript Imports
```typescript
// ✅ Use path aliases
import { NewsArticle } from '@/types'
import * as storage from '@/lib/news-storage-postgres'

// ✅ Type imports for types
import type { NextRequest } from 'next/server'
```

## Project Structure (Where to Make Changes)

```
src/
├── app/
│   ├── api/[resource]/route.ts    # API endpoints (GET/POST/PUT/DELETE)
│   ├── admin/[resource]/          # Admin pages (JWT protected)
│   ├── [resource]/                # Public pages
│   └── page.tsx                   # Homepage
├── components/
│   ├── admin/                     # Admin UI components
│   └── [Feature]*.tsx             # Feature components
├── lib/
│   ├── [resource]-storage-postgres.ts  # Database access layer
│   ├── database.ts                     # DB connection helper
│   └── auth.ts                         # JWT verification
├── types/
│   └── index.ts                   # TypeScript definitions
└── __tests__/                     # Test files

database/
├── schema.sql                     # Database schema
└── *.sql                          # Migration scripts

docs/                              # Extensive documentation
```

## Common Build Errors & Fixes

### Error: "Module not found" or "Cannot find module '@/lib/...'"
**Fix**: Check `tsconfig.json` has `"baseUrl": "."` and `"paths": {"@/*": ["./src/*"]}`

### Error: Database connection failed in build
**Fix**: Database queries in components must be in Server Components or API routes, not Client Components

### Error: "Hydration failed" or "Text content does not match"
**Cause**: Server/client rendering mismatch  
**Fix**: Ensure Server Components don't use client-only APIs. Use `suppressHydrationWarning` for dynamic content like dates

### Error: Image optimization failed
**Fix**: Check `next.config.js` `remotePatterns` includes the image domain (Cloudinary, Vercel Blob)

### Test Failures: "Cannot use import statement outside a module"
**Fix**: Already configured in `jest.config.js` with `babel-jest`. If persists, check `transformIgnorePatterns`

## Security Requirements (CRITICAL)

1. **SQL Injection Prevention**: Storage layer uses parameterized queries via Neon's `sql` tagged template
2. **Admin Routes**: ALL mutations (POST/PUT/DELETE) must call `verifyAdmin(request)` from `@/lib/auth`
3. **XSS Prevention**: React escapes by default. Use `dangerouslySetInnerHTML` only for trusted content
4. **Environment Variables**: Never commit `.env.local`. Use `process.env.VARIABLE_NAME`

## Styling & UI Guidelines

**Tailwind CSS only** - no CSS modules or styled-components

```tsx
// VGBF color palette
<div className="bg-vgbf-blue">    // Primary: #003366
<div className="bg-vgbf-green">   // Secondary: #006633  
<div className="bg-vgbf-gold">    // Accent: #FFD700

// Mobile-first responsive
<div className="p-4 md:p-8 lg:p-12"> // Base → medium → large
```

## Testing Requirements

- **API tests**: Mock storage layer, test all CRUD operations
- **Component tests**: Use React Testing Library, test user interactions
- **Coverage target**: 80%+ for new features
- See `TESTING.md` for detailed guidelines

## Deployment & CI/CD

- **Platform**: Vercel (automatic on push to `main`)
- **Build validation**: Next.js build must pass
- **Environment**: Production env vars in Vercel dashboard
- **Preview deployments**: Auto-created for PRs

## Key Documentation Files

- `README.md` - Setup, features, structure
- `TESTING.md` - Test patterns, coverage requirements
- `docs/architecture/` - System design, refactoring plans
- `docs/deployment/` - Deployment procedures
- `docs/troubleshooting/` - Common issues & solutions
- `database/schema.sql` - Database schema reference

## Decision-Making Priorities

1. **Security first**: Validate auth, prevent injection, protect data
2. **Type safety**: Strict TypeScript, no `any` types
3. **Performance**: Server Components, optimize images, cache where appropriate
4. **Maintainability**: Follow existing patterns, update docs for major changes
5. **Mobile-first**: Responsive design, test on mobile breakpoints

**When uncertain**: Search `docs/` directory or examine similar existing implementations in the codebase before proceeding.
