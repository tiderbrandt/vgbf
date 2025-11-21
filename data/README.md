# Legacy Data Files

This directory contains legacy JSON data files that were used before the database migration to PostgreSQL.

## Status

🔒 **Read-Only / Archive** - These files are kept for reference and backup purposes only.

## Files

- `board_members.json` - Legacy board member data
- `calendar.json` - Legacy calendar events
- `clubs.json` - Legacy club directory (older version)
- `clubs_new.json` - Legacy club directory (newer version)
- `competitions.json` - Legacy competition data
- `contact_info.json` - Legacy contact information
- `news.json` - Legacy news articles
- `records.json` - Legacy district records
- `sponsors.json` - Legacy sponsor data

## Current Data Storage

All production data is now stored in **PostgreSQL (Neon serverless database)**. 

- Data is managed through the admin interface at `/admin`
- API endpoints handle all CRUD operations
- See `/src/lib/db.ts` for database connection and queries

## Migration Scripts

Migration scripts that were used to import this data into PostgreSQL can be found in the `/database` directory.

## Note

These files may be referenced by some migration scripts in `/database` but are not used by the live application.
