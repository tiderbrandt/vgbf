# PostgreSQL Migration Plan

## Overview
We have successfully created a comprehensive PostgreSQL-only architecture to replace the mixed blob/PostgreSQL storage system that was causing 404 errors on individual news pages.

## What We've Created

### 1. PostgreSQL Storage Implementations
- ✅ `src/lib/news-storage-postgres.ts` - News articles with slug support
- ✅ `src/lib/competitions-storage-postgres.ts` - Competitions management  
- ✅ `src/lib/records-storage-postgres.ts` - District records
- ✅ `src/lib/sponsors-storage-postgres.ts` - Sponsors with priority ordering
- ✅ `src/lib/calendar-storage-postgres.ts` - Calendar events
- ✅ `src/lib/board-storage-postgres.ts` - Board members

### 2. Database Schema
- ✅ Updated `database/schema.sql` with proper string IDs and TypeScript alignment
- ✅ All tables use consistent naming and data types

### 3. Migration Infrastructure
- ✅ `scripts/migrate-blob-to-postgres.ts` - Comprehensive data migration script
- ✅ `src/app/api/postgres-migration/route.ts` - API for schema deployment and data migration

## Deployment Steps

### Step 1: Apply Database Schema
```bash
curl -X POST https://your-vercel-app.com/api/postgres-migration \
  -H "Content-Type: application/json" \
  -d '{"action": "apply-schema"}'
```

### Step 2: Migrate Data
```bash
curl -X POST https://your-vercel-app.com/api/postgres-migration \
  -H "Content-Type: application/json" \
  -d '{"action": "migrate-data"}'
```

### Step 3: Update Application Code
Replace all imports from `*-storage-unified` to `*-storage-postgres` in these files:
- `src/app/api/news/route.ts`
- `src/app/api/news/[slug]/route.ts`
- `src/app/api/competitions/route.ts`
- `src/app/api/records/route.ts`
- `src/app/api/sponsors/route.ts`
- `src/app/api/calendar/route.ts`
- And 10+ other files

### Step 4: Deploy Application
Push the updated code to Vercel to use PostgreSQL-only storage.

## Benefits

1. **Fixes 404 Issue**: Individual news pages will work because PostgreSQL has proper slug-based lookups
2. **Eliminates Confusion**: No more mixed storage - everything uses PostgreSQL except images (blob)
3. **Better Performance**: Direct database queries instead of blob file fetching
4. **Improved Reliability**: Database ACID properties vs file system operations
5. **Future-Proof**: Standard SQL database patterns for scaling

## Files That Need Import Updates (15+ files)
Based on grep search, these files currently import from `*-storage-unified`:
- `src/app/api/news/route.ts`
- `src/app/api/records/route.ts`
- `src/app/api/sponsors/route.ts`
- `src/app/api/competitions/route.ts`
- `src/app/api/migrate-clubs/route.ts`
- `src/app/api/news/[slug]/route.ts`
- `src/app/api/test-clubs/route.ts`
- `src/app/api/test-clubs-storage/route.ts`
- `src/app/api/migrate-data/route.ts`
- And others...

## Next Actions

1. Deploy schema using the migration API
2. Migrate data using the migration API  
3. Systematically update all imports from unified to postgres storage
4. Test the individual news pages (/nyheter/[slug])
5. Remove old blob storage files once confirmed working

## Rollback Plan
If issues occur, revert imports back to `*-storage-unified` while keeping the PostgreSQL tables as backup.
