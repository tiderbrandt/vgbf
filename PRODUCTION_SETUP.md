# Vercel Production Setup Guide

## Required Environment Variables for Production

You need to add these environment variables to your Vercel project:

### 1. Authentication Variables

```
JWT_SECRET=bbe428a7bc78d8b3247de5c80551299845e6cdc5bce963ac7f77701cf7e092f67034038f2ee0d98952c5378c4f1d86822c402a66358d5b64aa95fb176bd690ce
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_APP_URL=https://vgbf.vercel.app
```

### 2. Vercel Blob Storage Variable

**CRITICAL: This is required for image uploads to work!**

To get your `BLOB_READ_WRITE_TOKEN`:

#### Option A: Automatic (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Link your project: `vercel link`
3. Pull environment variables: `vercel env pull`
4. This will automatically add the `BLOB_READ_WRITE_TOKEN` to your local `.env.local`

#### Option B: Manual via Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `vgbf` project
3. Go to **Storage** tab
4. If you don't have a Blob store, create one
5. Copy the `BLOB_READ_WRITE_TOKEN` from the setup instructions
6. Go to **Settings** → **Environment Variables**
7. Add `BLOB_READ_WRITE_TOKEN` with the token value

## How to Add Environment Variables

### Via Vercel Dashboard:

1. Go to https://vercel.com/dashboard
2. Select your `vgbf` project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Name**: Variable name (e.g., `JWT_SECRET`)
   - **Value**: Variable value
   - **Environments**: Select **Production**, **Preview**, and **Development**
   - Click **Save**

### Via Vercel CLI:

```bash
# First, link your project and pull existing env vars
vercel link
vercel env pull

# Add each variable (you'll be prompted for the value)
vercel env add JWT_SECRET
vercel env add ADMIN_USERNAME
vercel env add ADMIN_PASSWORD
vercel env add NEXT_PUBLIC_APP_URL
vercel env add BLOB_READ_WRITE_TOKEN
```

## After Adding Environment Variables

1. **Redeploy your application:**

   ```bash
   git push origin main
   ```

   OR

   ```bash
   vercel --prod
   ```

2. **Test the functionality:**
   - Go to `https://vgbf.vercel.app/admin`
   - Login with admin/admin123
   - Try uploading an image in clubs/news
   - Verify the image appears correctly

## Troubleshooting Image Uploads

### Error: "Blob storage not configured"

- **Cause**: Missing `BLOB_READ_WRITE_TOKEN`
- **Solution**: Add the token to Vercel environment variables

### Error: "Unauthorized"

- **Cause**: Missing JWT authentication variables
- **Solution**: Add `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`

### Error: "File too large"

- **Cause**: File exceeds 4.5MB limit for server uploads
- **Solution**: Resize image or use client-side upload for larger files

### Error: Network/Upload fails

- **Cause**: Various network or configuration issues
- **Solution**: Check browser console and Vercel function logs

## Testing Locally

To test the Blob functionality locally:

1. **Get your environment variables:**

   ```bash
   vercel env pull
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Test upload functionality:**
   - Go to `http://localhost:3001/admin`
   - Login and test image uploads

## Security Notes

⚠️ **Important**: After setup, change the default admin credentials!

1. Generate a new strong JWT secret
2. Create a secure admin username and password
3. Update the environment variables in Vercel

## API Changes Made

The upload API has been updated to follow Vercel Blob documentation:

- ✅ Uses query parameters for filename and type
- ✅ Accepts file in request body (not FormData)
- ✅ Includes authentication verification
- ✅ Proper error handling and logging
- ✅ 4.5MB file size limit (Vercel server upload limit)

## Next Steps

1. Add environment variables to Vercel
2. Redeploy the application
3. Test image upload functionality
4. Change default admin credentials for security
