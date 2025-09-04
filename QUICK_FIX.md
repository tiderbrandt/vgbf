# Quick Fix for Vercel Deployment Issues

## Current Issues

1. **401 Unauthorized**: Missing environment variables in Vercel
2. **400 Bad Request**: Image loading from Vercel Blob Storage

## Immediate Actions Required

### 1. Add Environment Variables to Vercel

You need to add these environment variables to your Vercel project:

**Via Vercel Dashboard:**

1. Go to https://vercel.com/dashboard
2. Select your `vgbf` project
3. Go to Settings → Environment Variables
4. Add these variables:

```
JWT_SECRET=bbe428a7bc78d8b3247de5c80551299845e6cdc5bce963ac7f77701cf7e092f67034038f2ee0d98952c5378c4f1d86822c402a66358d5b64aa95fb176bd690ce
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_APP_URL=https://vgbf.vercel.app
```

**Via Vercel CLI (if you have it installed):**

```bash
npx vercel env add JWT_SECRET
# Paste: bbe428a7bc78d8b3247de5c80551299845e6cdc5bce963ac7f77701cf7e092f67034038f2ee0d98952c5378c4f1d86822c402a66358d5b64aa95fb176bd690ce

npx vercel env add ADMIN_USERNAME
# Enter: admin

npx vercel env add ADMIN_PASSWORD
# Enter: admin123

npx vercel env add NEXT_PUBLIC_APP_URL
# Enter: https://vgbf.vercel.app
```

### 2. Redeploy After Adding Environment Variables

After adding the environment variables, trigger a new deployment:

**Via Vercel Dashboard:**

- Go to Deployments tab
- Click "Redeploy" on the latest deployment

**Via Git:**

```bash
git add .
git commit -m "Fix: Add image domain configuration for Vercel Blob Storage"
git push origin main
```

**Via Vercel CLI:**

```bash
npx vercel --prod
```

### 3. Test the Fixes

After redeployment:

1. **Test Admin Login**: Go to https://vgbf.vercel.app/admin

   - Username: admin
   - Password: admin123

2. **Test Image Loading**: Check if news images load properly

3. **Test API Calls**: Try creating/editing news articles

### 4. Monitor for Issues

Check the Vercel function logs:

1. Go to Vercel Dashboard → Functions
2. Check the logs for any remaining errors

## Files Modified

- ✅ `next.config.js` - Added image domain configuration
- ✅ `VERCEL_DEPLOYMENT.md` - Created deployment guide
- ✅ `SafeImage.tsx` - Created robust image component

## What These Fixes Do

### Image Fix (`next.config.js`)

```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.public.blob.vercel-storage.com',
      port: '',
      pathname: '/**',
    }
  ],
}
```

This allows Next.js to load images from Vercel Blob Storage domains.

### Environment Variables

The JWT_SECRET and other environment variables are required for:

- Admin authentication
- API authorization
- Proper application configuration

## Next Steps After Fix

1. Change default admin credentials for security
2. Test all admin functionality
3. Monitor error logs for any remaining issues
4. Consider implementing proper user management
