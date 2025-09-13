# Analytics and SEO Integration Guide

This guide shows how to integrate the new analytics and SEO components into your Next.js application.

## Components Overview

### 1. SeoHead Component
- **File**: `src/components/SeoHead.tsx`
- **Purpose**: Provides comprehensive SEO meta tags, structured data, and analytics tracking
- **Features**: 
  - Open Graph and Twitter Card support
  - Google Analytics integration
  - Local visitor tracking (privacy-friendly)
  - Structured data for organizations and events

### 2. AnalyticsDashboard Component
- **File**: `src/components/AnalyticsDashboard.tsx`
- **Purpose**: Displays visitor statistics in a floating dashboard
- **Features**:
  - Real-time visitor stats
  - Popular pages tracking
  - Privacy-compliant local storage

### 3. CookieConsent Component
- **File**: `src/components/CookieConsent.tsx`
- **Purpose**: GDPR-compliant cookie consent banner
- **Features**:
  - Accept/decline analytics tracking
  - Privacy policy link
  - Settings management

## Quick Integration

### Step 1: Add to _app.tsx
```tsx
import SeoHead from '../components/SeoHead';
import CookieConsent from '../components/CookieConsent';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Default SEO for all pages */}
      <SeoHead />
      
      <Component {...pageProps} />
      
      {/* Analytics and Privacy */}
      <AnalyticsDashboard />
      <CookieConsent />
    </>
  );
}
```

### Step 2: Environment Variables
Copy `.env.example` to `.env.local` and configure:

```bash
NEXT_PUBLIC_SITE_URL=https://vgbf.se
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Optional
NEXT_PUBLIC_COOKIES_CONSENT_REQUIRED=true
```

### Step 3: Page-Specific SEO
```tsx
// In any page component
import SeoHead from '../components/SeoHead';

export default function NewsPage() {
  return (
    <>
      <SeoHead 
        title="Nyheter"
        description="Senaste nyheterna från Västra Götalands Bågskytteförbund"
        type="website"
      />
      <main>
        {/* Page content */}
      </main>
    </>
  );
}
```

### Step 4: Article/Event SEO
```tsx
// For news articles or events
<SeoHead 
  title={article.title}
  description={article.excerpt}
  image={article.image}
  type="article"
  publishedTime={article.publishedAt}
  author={article.author}
/>
```

## Analytics Features

### Local Analytics (Privacy-First)
- Tracks page views without external services
- Data stored locally in user's browser
- No personal data collection
- Automatic cleanup (30-day retention)

### Google Analytics (Optional)
- Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to enable
- Respects cookie consent choices
- Only loads when user accepts analytics

### Dashboard Usage
- Click the 📊 icon in bottom-right corner
- View total visits, today's visits, and popular pages
- All data is local to the user's browser

## Privacy Compliance

### GDPR Features
- Cookie consent banner for EU users
- Local data storage (no third-party sharing)
- Easy opt-out mechanism
- Privacy policy integration

### Consent Management
```tsx
import { useAnalyticsEnabled } from '../components/CookieConsent';

function MyComponent() {
  const analyticsEnabled = useAnalyticsEnabled();
  
  // Only track events if user consented
  if (analyticsEnabled) {
    // Track user interaction
  }
}
```

## SEO Features

### Automatic Meta Tags
- Title, description, keywords
- Open Graph (Facebook, LinkedIn)
- Twitter Cards
- Canonical URLs
- Language and locale

### Structured Data
- Organization schema for the site
- Article schema for news
- Event schema for competitions

### Performance
- Optimized image URLs
- Proper caching headers
- Minimal JavaScript for analytics

## Customization

### Custom Page Types
```tsx
<SeoHead 
  title="Tävlingskalender"
  type="event"
  publishedTime="2025-09-15T10:00:00Z"
/>
```

### Custom Analytics Events
```tsx
import { getVisitorStats } from '../components/SeoHead';

// Get current statistics
const stats = getVisitorStats();
console.log('Total views:', stats?.totalViews);
```

### Styling the Dashboard
```tsx
<AnalyticsDashboard className="hidden md:block" />
```

## Testing

### Development Mode
- Analytics tracking disabled in development
- Use production build to test: `npm run build && npm start`
- Check browser localStorage for visit data

### SEO Testing
- Use browser dev tools to inspect meta tags
- Test with social media preview tools
- Validate structured data with Google's Rich Results Test

## Deployment Checklist

1. ✅ Set production environment variables
2. ✅ Configure Google Analytics (if used)
3. ✅ Test cookie consent flow
4. ✅ Verify SEO meta tags
5. ✅ Check analytics dashboard functionality
6. ✅ Test on mobile devices

## Troubleshooting

### Analytics Not Working
- Check if `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
- Verify user has accepted cookies
- Ensure production build (analytics disabled in dev)

### SEO Issues
- Verify `NEXT_PUBLIC_SITE_URL` is correct
- Check page-specific meta tag overrides
- Validate structured data syntax

### Cookie Banner Not Showing
- Check `NEXT_PUBLIC_COOKIES_CONSENT_REQUIRED=true`
- Clear localStorage to reset consent
- Verify component is included in layout