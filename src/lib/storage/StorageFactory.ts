import { StorageInterface } from './StorageInterface'
import { LocalStorage } from './LocalStorage'
import { BlobStorage } from './BlobStorage'

/**
 * Storage factory that creates the appropriate storage implementation
 * based on environment and configuration
 */
export class StorageFactory {
  /**
   * Create a storage instance
   * @param type Storage type ('blob' | 'local' | 'auto')
   * @param filename The filename for the storage
   * @returns Storage interface implementation
   */
  static create<T extends { id: string }>(
    type: 'blob' | 'local' | 'auto',
    filename: string
  ): StorageInterface<T> {
    if (type === 'auto') {
      // Use blob storage in production, local in development
      type = process.env.NODE_ENV === 'production' ? 'blob' : 'local'
    }

    switch (type) {
      case 'blob':
        return new BlobStorage<T>(filename)
      case 'local':
        return new LocalStorage<T>(filename)
      default:
        throw new Error(`Unknown storage type: ${type}`)
    }
  }

  /**
   * Create storage with automatic type selection based on environment
   */
  static createAuto<T extends { id: string }>(filename: string): StorageInterface<T> {
    return StorageFactory.create<T>('auto', filename)
  }
}
