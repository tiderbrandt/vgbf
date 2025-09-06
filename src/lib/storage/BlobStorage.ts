import { put, list, del } from '@vercel/blob'
import { StorageInterface } from './StorageInterface'

/**
 * Vercel blob storage implementation
 * Stores data in Vercel's blob storage with local fallback
 */
export class BlobStorage<T extends { id: string }> implements StorageInterface<T> {
  private fallbackStorage: any // LocalStorage instance as fallback

  constructor(private fileName: string) {
    // Import LocalStorage dynamically to avoid circular dependency
    this.initializeFallback()
  }

  private async initializeFallback() {
    if (!this.fallbackStorage) {
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
    await this.initializeFallback()
    
    try {
      const blobUrl = await this.getBlobUrl()
      
      if (!blobUrl) {
        console.log(`Blob ${this.fileName} not found, using fallback`)
        return await this.fallbackStorage.read()
      }

      const response = await fetch(blobUrl)
      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error reading from blob storage:', error)
      console.log('Using fallback storage')
      return await this.fallbackStorage.read()
    }
  }

  async write(data: T[]): Promise<void> {
    await this.initializeFallback()
    
    try {
      const blob = await put(this.fileName, JSON.stringify(data, null, 2), {
        access: 'public',
        contentType: 'application/json',
      })
      console.log(`Data written to blob storage: ${blob.url}`)
    } catch (error) {
      console.error('Error writing to blob storage:', error)
      console.log('Using fallback storage')
      await this.fallbackStorage.write(data)
    }
  }

  async add(item: T): Promise<T> {
    const data = await this.read()
    data.unshift(item) // Add to beginning
    await this.write(data)
    return item
  }

  async update(predicate: (item: T) => boolean, updates: Partial<T>): Promise<T | null> {
    const data = await this.read()
    const index = data.findIndex(predicate)
    
    if (index === -1) {
      return null
    }
    
    data[index] = { ...data[index], ...updates }
    await this.write(data)
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
