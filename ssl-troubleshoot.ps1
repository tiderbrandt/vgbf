# SSL Troubleshooting Script for Vercel Deployment
# Run this if you're experiencing SSL certificate issues

Write-Host "VGBF SSL Troubleshooting Script" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

# Test if Vercel CLI is available
if (-not (Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Vercel CLI is not installed." -ForegroundColor Red
    Write-Host "Please install it with: npm i -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Adding debug environment variables..." -ForegroundColor Yellow

# Add debug environment variables that might help with SSL issues
Write-Host "   Setting DEBUG flag..." -ForegroundColor Cyan
"*" | npx vercel env add DEBUG production

Write-Host "   Setting NODE_ENV..." -ForegroundColor Cyan
"production" | npx vercel env add NODE_ENV production

Write-Host "   Setting VERCEL_ENV..." -ForegroundColor Cyan
"production" | npx vercel env add VERCEL_ENV production

Write-Host ""
Write-Host "2. Redeploying with SSL fixes..." -ForegroundColor Yellow
npx vercel --prod

Write-Host ""
Write-Host "3. Testing endpoints..." -ForegroundColor Yellow

# Test external news endpoint
Write-Host "   Testing external news API..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "https://vgbf.vercel.app/api/external-news" -Method Get -TimeoutSec 30
    Write-Host "   ✓ External news API working" -ForegroundColor Green
} catch {
    Write-Host "   ✗ External news API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test auth endpoint
Write-Host "   Testing authentication API..." -ForegroundColor Cyan
try {
    $authBody = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $authResponse = Invoke-RestMethod -Uri "https://vgbf.vercel.app/api/auth/login" -Method Post -Body $authBody -ContentType "application/json" -TimeoutSec 30
    if ($authResponse.success) {
        Write-Host "   ✓ Authentication API working" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Authentication failed: $($authResponse.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Authentication API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Troubleshooting Information:" -ForegroundColor Yellow
Write-Host "   Production URL: https://vgbf.vercel.app" -ForegroundColor White
Write-Host "   Admin URL: https://vgbf.vercel.app/admin" -ForegroundColor White
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White

Write-Host ""
Write-Host "5. If SSL issues persist:" -ForegroundColor Yellow
Write-Host "   • Check browser console for detailed SSL errors" -ForegroundColor White
Write-Host "   • Try accessing the site in incognito/private mode" -ForegroundColor White
Write-Host "   • Clear browser cache and cookies" -ForegroundColor White
Write-Host "   • Contact Vercel support if problems continue" -ForegroundColor White

Write-Host ""
Write-Host "6. To remove debug variables later:" -ForegroundColor Yellow
Write-Host "   npx vercel env rm DEBUG production" -ForegroundColor White

Write-Host ""
Write-Host "SSL troubleshooting complete!" -ForegroundColor Green
