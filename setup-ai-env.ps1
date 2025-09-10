# PowerShell script for Windows users
# Vercel Environment Variables Setup Script for VGBF AI Integration

Write-Host "🤖 Setting up AI Image Generation for VGBF on Vercel" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you configure environment variables for AI image generation." -ForegroundColor White
Write-Host "You can choose to set up either OpenAI DALL-E 3, Google Gemini, or both." -ForegroundColor White
Write-Host ""

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>$null
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Vercel CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm i -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Login check
Write-Host "🔐 Checking Vercel authentication..." -ForegroundColor Yellow
try {
    $whoami = vercel whoami 2>$null
    Write-Host "✅ Authenticated with Vercel as: $whoami" -ForegroundColor Green
}
catch {
    Write-Host "Please login to Vercel first:" -ForegroundColor Yellow
    vercel login
}

Write-Host ""

# Project selection
Write-Host "📂 Current project directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host "Make sure you're in the VGBF project directory" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Continue with environment setup? (y/n)"
if ($continue -ne "y" -and $continue -ne "Y") {
    exit 1
}

Write-Host ""
Write-Host "🔧 Environment Variable Setup" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

# OpenAI Setup
Write-Host ""
$setupOpenAI = Read-Host "Do you want to configure OpenAI DALL-E 3? (y/n)"
if ($setupOpenAI -eq "y" -or $setupOpenAI -eq "Y") {
    Write-Host ""
    Write-Host "📝 OpenAI DALL-E 3 Setup:" -ForegroundColor Yellow
    Write-Host "  1. Go to https://platform.openai.com/api-keys" -ForegroundColor White
    Write-Host "  2. Create a new API key" -ForegroundColor White
    Write-Host "  3. Copy the key (starts with 'sk-')" -ForegroundColor White
    Write-Host ""
    
    $openaiKey = Read-Host "Enter your OpenAI API key" -AsSecureString
    $openaiKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($openaiKey))
    
    if ($openaiKeyPlain -like "sk-*") {
        Write-Host "Setting OPENAI_API_KEY..." -ForegroundColor Yellow
        echo $openaiKeyPlain | vercel env add OPENAI_API_KEY production
        echo $openaiKeyPlain | vercel env add OPENAI_API_KEY preview
        Write-Host "✅ OpenAI API key configured" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Invalid OpenAI API key format (should start with 'sk-')" -ForegroundColor Red
    }
}

# Gemini Setup
Write-Host ""
$setupGemini = Read-Host "Do you want to configure Google Gemini? (y/n)"
if ($setupGemini -eq "y" -or $setupGemini -eq "Y") {
    Write-Host ""
    Write-Host "📝 Google Gemini Setup:" -ForegroundColor Yellow
    Write-Host "  1. Go to https://aistudio.google.com/app/apikey" -ForegroundColor White
    Write-Host "  2. Create a new API key" -ForegroundColor White
    Write-Host "  3. Copy the key (starts with 'AIza')" -ForegroundColor White
    Write-Host ""
    
    $geminiKey = Read-Host "Enter your Gemini API key" -AsSecureString
    $geminiKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($geminiKey))
    
    if ($geminiKeyPlain -like "AIza*") {
        Write-Host "Setting GEMINI_API_KEY..." -ForegroundColor Yellow
        echo $geminiKeyPlain | vercel env add GEMINI_API_KEY production
        echo $geminiKeyPlain | vercel env add GEMINI_API_KEY preview
        Write-Host "✅ Gemini API key configured" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Invalid Gemini API key format (should start with 'AIza')" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🚀 Deployment" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan
Write-Host ""
$deploy = Read-Host "Deploy the project with new environment variables? (y/n)"
if ($deploy -eq "y" -or $deploy -eq "Y") {
    Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
    vercel --prod
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Go to your production site admin settings" -ForegroundColor White
Write-Host "2. Navigate to the 'AI & API' tab" -ForegroundColor White
Write-Host "3. Choose your preferred AI provider" -ForegroundColor White
Write-Host "4. The API keys from environment variables will be used as fallback" -ForegroundColor White
Write-Host "5. You can also configure keys directly in the admin panel" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Admin Settings: https://vgbf.vercel.app/admin/settings" -ForegroundColor Cyan
Write-Host ""
