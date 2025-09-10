#!/usr/bin/env pwsh

# Cloudinary Setup Script for VGBF
# This script helps you configure Cloudinary credentials

Write-Host "🚀 VGBF Cloudinary Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 What you need:" -ForegroundColor Yellow
Write-Host "1. A free Cloudinary account (https://cloudinary.com)" -ForegroundColor White
Write-Host "2. Your Cloudinary credentials from the dashboard" -ForegroundColor White
Write-Host ""

Write-Host "🔑 Please provide your Cloudinary credentials:" -ForegroundColor Green
Write-Host ""

# Get Cloud Name
$cloudName = Read-Host "Enter your Cloudinary Cloud Name"
if ([string]::IsNullOrWhiteSpace($cloudName)) {
    Write-Host "❌ Cloud Name is required!" -ForegroundColor Red
    exit 1
}

# Get API Key
$apiKey = Read-Host "Enter your Cloudinary API Key"
if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "❌ API Key is required!" -ForegroundColor Red
    exit 1
}

# Get API Secret
$apiSecret = Read-Host -AsSecureString "Enter your Cloudinary API Secret"
$apiSecretPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiSecret))

if ([string]::IsNullOrWhiteSpace($apiSecretPlain)) {
    Write-Host "❌ API Secret is required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Updating .env.local file..." -ForegroundColor Blue

# Read current .env.local file
$envPath = ".env.local"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    
    # Replace placeholder values
    $envContent = $envContent -replace "CLOUDINARY_CLOUD_NAME=your-cloud-name", "CLOUDINARY_CLOUD_NAME=$cloudName"
    $envContent = $envContent -replace "CLOUDINARY_API_KEY=your-api-key", "CLOUDINARY_API_KEY=$apiKey"
    $envContent = $envContent -replace "CLOUDINARY_API_SECRET=your-api-secret", "CLOUDINARY_API_SECRET=$apiSecretPlain"
    $envContent = $envContent -replace "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name", "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$cloudName"
    
    # Write updated content
    $envContent | Set-Content $envPath -NoNewline
    
    Write-Host "✅ Environment variables updated successfully!" -ForegroundColor Green
}
else {
    Write-Host "❌ .env.local file not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your development server: npm run dev" -ForegroundColor White
Write-Host "2. Test image upload at: http://localhost:3001/admin/news/new" -ForegroundColor White
Write-Host "3. Check your Cloudinary dashboard for uploaded images" -ForegroundColor White
Write-Host ""
Write-Host "📈 Benefits you now have:" -ForegroundColor Cyan
Write-Host "• 25GB storage (25x more than Vercel Blob)" -ForegroundColor White
Write-Host "• Automatic image optimization" -ForegroundColor White
Write-Host "• Built-in CDN for faster delivery" -ForegroundColor White
Write-Host "• Advanced image transformations" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see CLOUDINARY_MIGRATION.md" -ForegroundColor Gray
