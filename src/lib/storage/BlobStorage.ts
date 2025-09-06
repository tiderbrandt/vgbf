import { put, list, del } from '@vercel/blob'
import { StorageInterface } from './StorageInterface'

/**
 * Vercel blob storage implementation
 * Stores data in Vercel's blob storage with local fallback only in development
 */
export class BlobStorage<T extends { id: string }> implements StorageInterface<T> {
  private fallbackStorage: any // LocalStorage instance as fallback (dev only)

  constructor(private fileName: string) {
    // Initialize fallback only in development
    if (process.env.NODE_ENV !== 'production') {
      this.initializeFallback()
    }
  }

  private async initializeFallback() {
    if (!this.fallbackStorage && process.env.NODE_ENV !== 'production') {
      const { LocalStorage } = await import('./LocalStorage')
      this.fallbackStorage = new LocalStorage<T>(this.fileName)
    }
  }

  private async getBlobUrl(): Promise<string | null> {
    try {
      const { blobs } = await list()
      const blob = blobs.find(b => b.pathname === this.fileName)
      return blob?.url || null
    } catch (error) {
      console.error('Error listing blobs:', error)
      return null
    }
  }

  async read(): Promise<T[]> {
    try {
      const blobUrl = await this.getBlobUrl()
      
      if (!blobUrl) {
        console.log(`Blob ${this.fileName} not found`)
        
        // Only use fallback in development
        if (process.env.NODE_ENV !== 'production') {
          await this.initializeFallback()
          if (this.fallbackStorage) {
            console.log('Using fallback storage (development)')
            return await this.fallbackStorage.read()
          }
        }
        
        // Return empty array in production if no blob found
        return []
      }

      const response = await fetch(blobUrl)
      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error reading from blob storage:', error)
      
      // Only use fallback in development
      if (process.env.NODE_ENV !== 'production') {
        await this.initializeFallback()
        if (this.fallbackStorage) {
          console.log('Using fallback storage (development)')
          return await this.fallbackStorage.read()
        }
      }
      
      // Return empty array in production if blob storage fails
      return []
    }
  }

  async write(data: T[]): Promise<void> {
    try {
      console.log('BlobStorage.write - Starting write with filename:', this.fileName)
      console.log('BlobStorage.write - Data length:', data.length)
      
      const putOptions = {
        access: 'public' as const,
        contentType: 'application/json',
        allowOverwrite: true
      }
      
      console.log('BlobStorage.write - Put options:', JSON.stringify(putOptions))
      
      const blob = await put(this.fileName, JSON.stringify(data, null, 2), putOptions)
      console.log(`BlobStorage.write - Data written to blob storage: ${blob.url}`)
    } catch (error) {
      console.error('BlobStorage.write - Error writing to blob storage:', error)
      
      // Only use fallback in development
      if (process.env.NODE_ENV !== 'production') {
        await this.initializeFallback()
        if (this.fallbackStorage) {
          console.log('Using fallback storage (development)')
          await this.fallbackStorage.write(data)
          return
        }
      }
      
      // Re-throw error in production to alert of storage failure
      throw error
    }
  }

  async add(item: T): Promise<T> {
    const data = await this.read()
    data.unshift(item) // Add to beginning
    await this.write(data)
    return item
  }

  async update(predicate: (item: T) => boolean, updates: Partial<T>): Promise<T | null> {
    console.log('BlobStorage.update - Starting update process')
    
    const data = await this.read()
    console.log('BlobStorage.update - Read data, count:', data.length)
    
    const index = data.findIndex(predicate)
    console.log('BlobStorage.update - Found index:', index)
    
    if (index === -1) {
      console.log('BlobStorage.update - Item not found')
      return null
    }
    
    console.log('BlobStorage.update - Applying updates to item at index:', index)
    data[index] = { ...data[index], ...updates }
    
    console.log('BlobStorage.update - Writing updated data to storage')
    await this.write(data)
    
    console.log('BlobStorage.update - Update completed successfully')
    return data[index]
  }

  async delete(predicate: (item: T) => boolean): Promise<boolean> {
    const data = await this.read()
    const initialLength = data.length
    const filteredData = data.filter(item => !predicate(item))
    
    if (filteredData.length === initialLength) {
      return false // Item not found
    }
    
    await this.write(filteredData)
    return true
  }

  async findOne(predicate: (item: T) => boolean): Promise<T | undefined> {
    const data = await this.read()
    return data.find(predicate)
  }
}
