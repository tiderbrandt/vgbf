'use client'

import Image from 'next/image'
import { useState } from 'react'

interface CloudinaryImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
}

export default function CloudinaryImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL
}: CloudinaryImageProps) {
  const [imageError, setImageError] = useState(false)

  // Check if the image is from Cloudinary
  const isCloudinaryImage = src.includes('cloudinary.com') || src.includes('res.cloudinary.com')
  
  // If it's a Cloudinary image, we can use optimized URLs
  const getOptimizedSrc = () => {
    if (!isCloudinaryImage) return src
    
    // Extract public ID from Cloudinary URL
    const urlParts = src.split('/')
    const uploadIndex = urlParts.findIndex(part => part === 'upload')
    
    if (uploadIndex === -1) return src
    
    const publicIdWithParams = urlParts.slice(uploadIndex + 1).join('/')
    const publicId = publicIdWithParams.split('?')[0] // Remove query params if any
    
    // Build optimized URL with transformations
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const transformations = [
      'f_auto', // Auto format
      'q_auto:good' // Auto quality
    ]
    
    if (width) transformations.push(`w_${width}`)
    if (height) transformations.push(`h_${height}`)
    
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations.join(',')}/${publicId}`
  }

  // Fallback image in case of error
  const fallbackSrc = '/vgbf-logo.png'

  if (imageError) {
    return (
      <Image
        src={fallbackSrc}
        alt={`Fallback image for ${alt}`}
        width={width}
        height={height}
        className={className}
        priority={priority}
        fill={fill}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
      />
    )
  }

  return (
    <Image
      src={getOptimizedSrc()}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      fill={fill}
      sizes={sizes}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      onError={() => setImageError(true)}
    />
  )
}
