#!/bin/bash
# Vercel Environment Variables Setup Script

echo "Adding environment variables to Vercel..."

# Add JWT_SECRET
echo "Adding JWT_SECRET..."
echo "bbe428a7bc78d8b3247de5c80551299845e6cdc5bce963ac7f77701cf7e092f67034038f2ee0d98952c5378c4f1d86822c402a66358d5b64aa95fb176bd690ce" | npx vercel env add JWT_SECRET production

# Add ADMIN_USERNAME
echo "Adding ADMIN_USERNAME..."
echo "admin" | npx vercel env add ADMIN_USERNAME production

# Add ADMIN_PASSWORD
echo "Adding ADMIN_PASSWORD..."
echo "admin123" | npx vercel env add ADMIN_PASSWORD production

# Add NEXT_PUBLIC_APP_URL
echo "Adding NEXT_PUBLIC_APP_URL..."
echo "https://vgbf.vercel.app" | npx vercel env add NEXT_PUBLIC_APP_URL production

echo "Environment variables added. Deploying to production..."
npx vercel --prod

echo "Setup complete!"
