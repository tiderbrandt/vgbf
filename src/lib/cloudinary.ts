import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

// Upload a file buffer to Cloudinary
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options: {
    folder?: string
    filename?: string
    resourceType?: 'image' | 'video' | 'raw' | 'auto'
  } = {}
): Promise<{
  url: string
  publicId: string
  secureUrl: string
  width?: number
  height?: number
}> {
  const { folder = 'vgbf', filename, resourceType = 'image' } = options

  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: resourceType,
      transformation: [
        {
          quality: 'auto:good',
          fetch_format: 'auto'
        }
      ]
    }

    if (filename) {
      uploadOptions.public_id = `${folder}/${filename.replace(/\.[^/.]+$/, '')}`
    }

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error)
          reject(error)
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            secureUrl: result.secure_url,
            width: result.width,
            height: result.height
          })
        } else {
          reject(new Error('Upload failed - no result returned'))
        }
      }
    ).end(fileBuffer)
  })
}

// Delete an image from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    throw error
  }
}

// Generate optimized image URL
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string
    format?: string
  } = {}
): string {
  const { width, height, crop = 'fill', quality = 'auto:good', format = 'auto' } = options
  
  const transformations = [
    `q_${quality}`,
    `f_${format}`
  ]
  
  if (width && height) {
    transformations.push(`w_${width}`, `h_${height}`, `c_${crop}`)
  } else if (width) {
    transformations.push(`w_${width}`)
  } else if (height) {
    transformations.push(`h_${height}`)
  }
  
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${transformations.join(',')}/${publicId}`
}
