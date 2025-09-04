import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { verifyAdminToken, createUnauthorizedResponse } from '@/lib/auth'

// Ensure uploads directory exists
async function ensureUploadsDirectory(contentType: string = 'news') {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', contentType)
  try {
    await fs.access(uploadsDir)
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true })
  }
  return uploadsDir
}

// Generate unique filename
function generateFilename(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = path.extname(originalName).toLowerCase()
  const baseName = path.basename(originalName, extension)
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()
  
  return `${timestamp}-${randomString}-${baseName}${extension}`
}

// Validate file type
function isValidImageType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  return allowedTypes.includes(file.type)
}

// Validate file size (max 5MB)
function isValidFileSize(file: File): boolean {
  const maxSize = 5 * 1024 * 1024 // 5MB
  return file.size <= maxSize
}

export async function POST(request: NextRequest) {
  // Check authentication
  const authHeader = request.headers.get('authorization')
  if (!verifyAdminToken(authHeader)) {
    return createUnauthorizedResponse()
  }

  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const contentType = formData.get('contentType') as string || 'news'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!isValidImageType(file)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (!isValidFileSize(file)) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Ensure uploads directory exists
    const uploadsDir = await ensureUploadsDirectory(contentType)

    // Generate unique filename
    const filename = generateFilename(file.name)
    const filepath = path.join(uploadsDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await fs.writeFile(filepath, buffer)

    // Return the public URL
    const publicUrl = `/uploads/${contentType}/${filename}`

    return NextResponse.json({
      success: true,
      data: {
        filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        url: publicUrl
      }
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
