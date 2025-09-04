# Vercel Deployment Guide

## Environment Variables Setup

Your Vercel deployment is missing required environment variables. You need to add these to your Vercel project:

### Required Environment Variables

1. **JWT_SECRET**

   ```
   bbe428a7bc78d8b3247de5c80551299845e6cdc5bce963ac7f77701cf7e092f67034038f2ee0d98952c5378c4f1d86822c402a66358d5b64aa95fb176bd690ce
   ```

2. **ADMIN_USERNAME**

   ```
   admin
   ```

3. **ADMIN_PASSWORD**

   ```
   admin123
   ```

4. **NEXT_PUBLIC_APP_URL**
   ```
   https://vgbf.vercel.app
   ```

### How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your `vgbf` project
3. Go to **Settings** → **Environment Variables**
4. Add each variable above with the corresponding value
5. Make sure to add them for **Production**, **Preview**, and **Development** environments
6. After adding all variables, redeploy your application

### Alternative: Using Vercel CLI

If you have Vercel CLI installed, you can add environment variables using:

```bash
vercel env add JWT_SECRET
# Then paste the JWT secret value when prompted

vercel env add ADMIN_USERNAME
# Enter: admin

vercel env add ADMIN_PASSWORD
# Enter: admin123

vercel env add NEXT_PUBLIC_APP_URL
# Enter: https://vgbf.vercel.app
```

After adding environment variables, redeploy:

```bash
vercel --prod
```

## Security Recommendations

⚠️ **Important**: Change the default admin credentials in production!

1. Generate a new strong JWT secret
2. Use a secure admin username and password
3. Consider implementing proper user management

## Troubleshooting

### 401 Unauthorized Errors

- Verify all environment variables are set in Vercel
- Check that JWT_SECRET matches between local and production
- Ensure you're logged in as admin before making API calls

### Image Loading Issues

- The Next.js configuration has been updated to allow Vercel Blob Storage domains
- Redeploy after updating next.config.js
- Verify image URLs are valid Vercel Blob Storage URLs

### After Configuration

1. Add all environment variables to Vercel
2. Redeploy the application
3. Test admin login functionality
4. Verify image loading works correctly
