# Database Scripts

This directory contains SQL schemas and migration scripts for the PostgreSQL database.

## Active Schema Files

- `schema.sql` - Current database schema
- `optimal-schema.sql` - Optimized schema with indexes and constraints
- `add-settings-table.sql` - Settings table schema
- `add-users-table.sql` - Users/authentication table schema

## Migration Scripts

These scripts were used to migrate data from JSON files to PostgreSQL:

- `migrate-calendar.mjs` - Migrated calendar events to database
- `migrate-competitions.mjs` - Migrated competition data to database
- `add-missing-records-api.mjs` - Added missing records via API
- `add-missing-records.mjs` - Added missing records directly
- `add-competition-columns.js` - Added columns to competitions table
- `create-users-tables.mjs` - Created user authentication tables

## Database Connection

The live application connects to PostgreSQL through:
- **Production**: Neon serverless PostgreSQL
- **Connection**: See `/src/lib/db.ts`
- **Environment**: `DATABASE_URL` in `.env.local`

## Running Migrations

Most migrations have already been run in production. These scripts are kept for reference and potential rollback scenarios.

To run a migration script:
```bash
node database/script-name.mjs
```

**Warning**: Be careful running these scripts as they may modify production data.

## Schema Updates

When updating the database schema:
1. Create a new SQL file with descriptive name
2. Test in development environment first
3. Document the changes in this README
4. Run in production during maintenance window
5. Update `/src/lib/db.ts` if needed
