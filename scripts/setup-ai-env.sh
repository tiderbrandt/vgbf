#!/bin/bash

# Vercel Environment Variables Setup Script for VGBF AI Integration
# Run this script to configure AI image generation on Vercel

echo "🤖 Setting up AI Image Generation for VGBF on Vercel"
echo "================================================="

echo ""
echo "This script will help you configure environment variables for AI image generation."
echo "You can choose to set up either OpenAI DALL-E 3, Google Gemini, or both."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first:"
    echo "   npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI found"
echo ""

# Login check
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel first:"
    vercel login
fi

echo "✅ Authenticated with Vercel"
echo ""

# Project selection
echo "📂 Current project directory: $(pwd)"
echo "Make sure you're in the VGBF project directory"
echo ""

read -p "Continue with environment setup? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo ""
echo "🔧 Environment Variable Setup"
echo "=============================="

# OpenAI Setup
echo ""
read -p "Do you want to configure OpenAI DALL-E 3? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📝 OpenAI DALL-E 3 Setup:"
    echo "  1. Go to https://platform.openai.com/api-keys"
    echo "  2. Create a new API key"
    echo "  3. Copy the key (starts with 'sk-')"
    echo ""
    read -p "Enter your OpenAI API key: " openai_key
    
    if [[ $openai_key == sk-* ]]; then
        echo "Setting OPENAI_API_KEY..."
        vercel env add OPENAI_API_KEY production <<< "$openai_key"
        vercel env add OPENAI_API_KEY preview <<< "$openai_key"
        echo "✅ OpenAI API key configured"
    else
        echo "❌ Invalid OpenAI API key format (should start with 'sk-')"
    fi
fi

# Gemini Setup
echo ""
read -p "Do you want to configure Google Gemini? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📝 Google Gemini Setup:"
    echo "  1. Go to https://aistudio.google.com/app/apikey"
    echo "  2. Create a new API key"
    echo "  3. Copy the key (starts with 'AIza')"
    echo ""
    read -p "Enter your Gemini API key: " gemini_key
    
    if [[ $gemini_key == AIza* ]]; then
        echo "Setting GEMINI_API_KEY..."
        vercel env add GEMINI_API_KEY production <<< "$gemini_key"
        vercel env add GEMINI_API_KEY preview <<< "$gemini_key"
        echo "✅ Gemini API key configured"
    else
        echo "❌ Invalid Gemini API key format (should start with 'AIza')"
    fi
fi

echo ""
echo "🚀 Deployment"
echo "============="
echo ""
read -p "Deploy the project with new environment variables? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deploying to Vercel..."
    vercel --prod
    echo "✅ Deployment complete!"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Go to your production site admin settings"
echo "2. Navigate to the 'AI & API' tab"
echo "3. Choose your preferred AI provider"
echo "4. The API keys from environment variables will be used as fallback"
echo "5. You can also configure keys directly in the admin panel"
echo ""
echo "🔗 Admin Settings: https://vgbf.vercel.app/admin/settings"
echo ""
