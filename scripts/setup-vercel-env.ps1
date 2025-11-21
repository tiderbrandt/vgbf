# Vercel Environment Variables Setup Script for Windows

Write-Host "Adding environment variables to Vercel..." -ForegroundColor Green

# Add JWT_SECRET
Write-Host "Adding JWT_SECRET..." -ForegroundColor Yellow
"bbe428a7bc78d8b3247de5c80551299845e6cdc5bce963ac7f77701cf7e092f67034038f2ee0d98952c5378c4f1d86822c402a66358d5b64aa95fb176bd690ce" | npx vercel env add JWT_SECRET production

# Add ADMIN_USERNAME
Write-Host "Adding ADMIN_USERNAME..." -ForegroundColor Yellow
"admin" | npx vercel env add ADMIN_USERNAME production

# Add ADMIN_PASSWORD  
Write-Host "Adding ADMIN_PASSWORD..." -ForegroundColor Yellow
"admin123" | npx vercel env add ADMIN_PASSWORD production

# Add NEXT_PUBLIC_APP_URL
Write-Host "Adding NEXT_PUBLIC_APP_URL..." -ForegroundColor Yellow
"https://vgbf.vercel.app" | npx vercel env add NEXT_PUBLIC_APP_URL production

# Add BLOB_READ_WRITE_TOKEN (already exists but ensuring it's set)
Write-Host "Adding BLOB_READ_WRITE_TOKEN..." -ForegroundColor Yellow
"vercel_blob_rw_sl4cL3JYmOzcYF0x_aVwTRzrSblR3HnN6DWCxO85ZXAlFVW" | npx vercel env add BLOB_READ_WRITE_TOKEN production

Write-Host "Environment variables added. Deploying to production..." -ForegroundColor Green
npx vercel --prod

Write-Host "Setup complete! Your production site should now have working authentication." -ForegroundColor Green
Write-Host "You can now log in at https://vgbf.vercel.app/admin with:" -ForegroundColor Cyan
Write-Host "Username: admin" -ForegroundColor White
Write-Host "Password: admin123" -ForegroundColor White
