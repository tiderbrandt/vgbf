'use client'

import { useState } from 'react'
import Image from 'next/image'

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  fallbackSrc?: string
}

export default function SafeImage({ 
  src, 
  alt, 
  className = "",
  width,
  height,
  fallbackSrc = "/vgbf-logo.png"
}: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    console.warn(`Failed to load image: ${imageSrc}`)
    if (!hasError && imageSrc !== fallbackSrc) {
      setHasError(true)
      setImageSrc(fallbackSrc)
    }
  }

  // Use regular img tag for external URLs to avoid Next.js Image optimization issues
  if (src.startsWith('http')) {
    return (
      <div className={`relative ${className}`} style={width && height ? { width, height } : undefined}>
        <Image
          src={imageSrc}
          alt={alt}
          fill={!width && !height}
          width={width}
          height={height}
          className={!width && !height ? className : undefined}
          onError={handleError}
          unoptimized
        />
      </div>
    )
  }

  // Use Next.js Image for local images
  return (
    <Image
      src={imageSrc}
      alt={alt}
      className={className}
      width={width || 400}
      height={height || 300}
      onError={handleError}
    />
  )
}
