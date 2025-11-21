# 🚨 AI Image Generation 503 Error - Troubleshooting Guide

## Problem

Getting a **503 Service Unavailable** error when trying to use AI image generation on production (Vercel).

## Root Cause

The 503 error typically occurs because:

1. **No API keys configured** - Neither in admin settings nor environment variables
2. **Database connection issues** - Settings can't be loaded from the database
3. **Function timeout** - The API call is taking too long

## 🔧 Quick Fix Solutions

### Solution 1: Configure Environment Variables on Vercel

The fastest way to fix this is to add API keys as environment variables:

1. **Go to Vercel Dashboard**

   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your VGBF project

2. **Add Environment Variables**

   - Go to Settings → Environment Variables
   - Add one or both of these:
     ```
     OPENAI_API_KEY = sk-your-openai-key-here
     GEMINI_API_KEY = AIza-your-gemini-key-here
     ```

3. **Redeploy**
   - Trigger a new deployment to apply the environment variables

### Solution 2: Use Admin Settings (Alternative)

1. Go to your production admin settings: `https://vgbf.vercel.app/admin/settings`
2. Navigate to the "AI & API" tab
3. Configure your API keys there
4. Save settings

### Solution 3: Use Setup Scripts

Run the provided setup scripts:

**For Windows (PowerShell):**

```powershell
.\setup-ai-env.ps1
```

**For Mac/Linux (Bash):**

```bash
chmod +x setup-ai-env.sh
./setup-ai-env.sh
```

## 🔍 Debugging Steps

### 1. Check API Status

Visit: `https://vgbf.vercel.app/api/ai-status`
This will show you:

- Whether settings are loading
- Which provider is configured
- Whether API keys are available

### 2. Check Local Development

Test locally first:

```bash
npm run dev
# Visit http://localhost:3001/admin/news/new
# Try AI image generation
```

### 3. Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Functions
2. Look at the logs for `/api/generate-image`
3. Check for specific error messages

## 🎯 Expected API Response

### Successful Response

```json
{
  "success": true,
  "data": {
    "url": "https://generated-image-url.jpg",
    "provider": "openai",
    "model": "dall-e-3"
  }
}
```

### Error Response (503)

```json
{
  "success": false,
  "error": "OpenAI API key inte konfigurerad",
  "debug": "No OpenAI key found in settings or environment"
}
```

## 🚀 Getting API Keys

### OpenAI DALL-E 3

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)
4. Ensure you have credits/billing set up

### Google Gemini (Optional)

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key (starts with `AIza`)

## ✅ Verification Steps

After configuration:

1. ✅ Environment variables are set on Vercel
2. ✅ Project is redeployed
3. ✅ `/api/ai-status` returns success
4. ✅ AI image generation works in admin panel

## 📞 Still Having Issues?

If you're still getting 503 errors:

1. **Check Vercel Function Logs** - Look for specific error messages
2. **Verify API Key Format** - Ensure keys start with `sk-` (OpenAI) or `AIza` (Gemini)
3. **Check API Quotas** - Ensure you have available credits
4. **Database Connection** - Verify your Neon database is accessible
5. **Try Different Provider** - Switch between OpenAI and Gemini

## 🎯 Current Status

The AI image generation system supports:

- ✅ **OpenAI DALL-E 3** (Primary, fully functional)
- ⚠️ **Google Gemini** (Structure ready, API may need adjustment)
- ✅ **Dual configuration** (Admin settings + Environment variables)
- ✅ **Fallback support** (Environment variables as backup)
