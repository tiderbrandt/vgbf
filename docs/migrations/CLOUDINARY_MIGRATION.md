# Cloudinary Migration Guide

## 🎉 Migration Complete!

Your VGBF website has been successfully migrated from Vercel Blob to Cloudinary for image storage. This gives you **25x more storage space** (25GB vs 1GB) and better image optimization.

## ⚙️ Setup Instructions

### 1. Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Navigate to your Dashboard

### 2. Get Your Credentials

From your Cloudinary Dashboard, copy these values:

- **Cloud Name** (e.g., `your-cloud-name`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Update Environment Variables

#### Local Development (.env.local)

Replace the placeholder values in your `.env.local` file:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
CLOUDINARY_API_KEY=your-actual-api-key
CLOUDINARY_API_SECRET=your-actual-api-secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-actual-cloud-name
```

#### Vercel Deployment

Add these environment variables in your Vercel dashboard:

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add these variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

## ✨ What's New

### Features Added:

- ✅ **25GB free storage** (vs 1GB with Vercel Blob)
- ✅ **Automatic image optimization** (format, quality, compression)
- ✅ **Built-in CDN** for faster image delivery
- ✅ **Image transformations** (resize, crop, format conversion)
- ✅ **Better performance** with optimized delivery

### Files Modified:

- ✅ `src/lib/cloudinary.ts` - New Cloudinary configuration
- ✅ `src/app/api/upload/route.ts` - Updated upload API
- ✅ `src/components/CloudinaryImage.tsx` - New optimized image component
- ✅ `next.config.js` - Added Cloudinary domains
- ✅ `.env.local` - Added Cloudinary environment variables

## 🔄 Migration Status

### Completed:

- [x] Cloudinary SDK installed
- [x] Upload API migrated to Cloudinary
- [x] Environment variables configured
- [x] Next.js configuration updated
- [x] Optimized image component created

### Next Steps:

1. **Set up Cloudinary account** and get credentials
2. **Update environment variables** with your actual Cloudinary credentials
3. **Test image uploads** in the admin panel
4. **Optional**: Migrate existing images from Vercel Blob

## 🧪 Testing

After setting up your credentials:

1. **Start development server**:

   ```bash
   npm run dev
   ```

2. **Test image upload**:

   - Go to `http://localhost:3000/admin/news/new`
   - Try uploading an image
   - Verify it appears correctly

3. **Check Cloudinary dashboard**:
   - Images should appear in your Cloudinary media library
   - They'll be organized in folders: `vgbf/news/`, `vgbf/clubs/`, etc.

## 🎯 Benefits

### Storage Comparison:

| Feature         | Vercel Blob | Cloudinary     |
| --------------- | ----------- | -------------- |
| Storage         | 1GB         | **25GB**       |
| Bandwidth       | Limited     | **25GB/month** |
| Optimization    | Basic       | **Advanced**   |
| Transformations | No          | **Yes**        |
| CDN             | Yes         | **Yes**        |

### Performance Improvements:

- **Automatic format conversion** (WebP, AVIF when supported)
- **Quality optimization** based on content
- **Responsive images** with automatic sizing
- **Lazy loading** support
- **Global CDN** for faster delivery

## 🔧 Advanced Usage

### Custom Image Transformations:

```typescript
import { getOptimizedImageUrl } from "@/lib/cloudinary";

// Generate a 300x200 thumbnail
const thumbnailUrl = getOptimizedImageUrl(publicId, {
  width: 300,
  height: 200,
  crop: "fill",
  quality: "auto:good",
});
```

### Using CloudinaryImage Component:

```tsx
import CloudinaryImage from "@/components/CloudinaryImage";

<CloudinaryImage
  src="https://res.cloudinary.com/your-cloud/image/upload/v1234567890/sample.jpg"
  alt="Sample image"
  width={800}
  height={600}
  className="rounded-lg"
  priority={true}
/>;
```

## 🚨 Important Notes

1. **Keep Vercel Blob token** for now (existing images might still use it)
2. **Test thoroughly** before removing Vercel Blob configuration
3. **Monitor usage** in Cloudinary dashboard to stay within free limits
4. **Backup strategy**: Consider exporting important images periodically

## 📞 Support

If you encounter any issues:

1. Check that all environment variables are set correctly
2. Verify your Cloudinary account is active
3. Check the browser console for error messages
4. Review the server logs for upload errors

Your image storage is now powered by Cloudinary! 🚀
