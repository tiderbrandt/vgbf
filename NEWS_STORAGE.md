# News Data Storage Documentation

## How News Data is Saved

The VGBF website now uses **JSON file storage** to persist news articles. Here's how it works:

### 📁 Storage Location

- **File**: `data/news.json` (in the project root)
- **Format**: JSON array of news articles
- **Auto-created**: If the file doesn't exist, it's created with default articles

### 🔄 How It Works

1. **Reading News**: All news functions read from `data/news.json`
2. **Writing News**: When you add/edit/delete articles, the file is updated
3. **Backup**: The original articles are included as defaults if file is corrupted

### 🛠 API Endpoints

- `GET /api/news` - Get all news articles
- `GET /api/news?type=featured` - Get featured articles only
- `GET /api/news?type=recent&limit=4` - Get recent articles with limit
- `POST /api/news` - Add new article
- `GET /api/news/[slug]` - Get specific article
- `PUT /api/news/[slug]` - Update article
- `DELETE /api/news/[slug]` - Delete article

### 📝 Using the Admin Interface

1. **Visit**: `/admin` to manage news
2. **Add**: Click "Lägg till nyhet" to create new articles
3. **Edit**: Click "Redigera" next to any article
4. **Delete**: Click "Ta bort" to remove articles

### 💾 Data Persistence

✅ **Persistent**: All changes are saved to `data/news.json`
✅ **Automatic**: No manual file management needed
✅ **Backup**: Default articles are preserved
✅ **Real-time**: Changes appear immediately

### 🔒 Production Considerations

#### Current Setup (File Storage)

- ✅ Simple and works for small sites
- ✅ No database required
- ❌ Not suitable for multiple editors
- ❌ File permissions needed on server

#### Upgrade Options

**For larger sites, consider upgrading to:**

1. **SQLite Database**

   ```bash
   npm install sqlite3
   ```

2. **PostgreSQL/MySQL**

   ```bash
   npm install pg mysql2
   ```

3. **Headless CMS**

   - Strapi
   - Contentful
   - Sanity

4. **Cloud Solutions**
   - Vercel KV
   - Supabase
   - Firebase

### 🚀 Deployment Notes

#### Vercel Deployment

- ✅ File storage works on Vercel
- ⚠️ Files are read-only in production
- 💡 Use Vercel KV for production persistence

#### Self-hosted Deployment

- ✅ Full file write access
- ✅ Perfect for VPS/dedicated servers
- 📁 Ensure `data/` directory has write permissions

### 🔧 Configuration

The storage system is configured in `src/lib/news-storage.ts`:

```typescript
// Change this path if needed
const NEWS_FILE_PATH = path.join(process.cwd(), "data", "news.json");
```

### 📋 File Structure

```json
[
  {
    "id": "unique-id",
    "title": "Article Title",
    "excerpt": "Short description...",
    "content": "Full article content...",
    "date": "2025-09-03",
    "author": "Author Name",
    "slug": "url-friendly-slug",
    "featured": true,
    "tags": ["tag1", "tag2"]
  }
]
```

### 🛡️ Data Safety

- **Auto-backup**: Default articles are preserved
- **Error handling**: Graceful fallback if file is corrupted
- **Validation**: Data is validated before saving
- **Git**: Add `data/news.json` to `.gitignore` if desired

## Quick Start

1. **Access admin**: Visit `/admin`
2. **Add news**: Click "Lägg till nyhet"
3. **Fill form**: Title, excerpt, content, etc.
4. **Save**: Article is immediately saved to `data/news.json`
5. **View**: Article appears on `/nyheter` and homepage

The system is ready to use! All news changes are automatically saved and will persist between server restarts.
