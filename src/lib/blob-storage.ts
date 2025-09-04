import { put, head, BlobNotFoundError } from '@vercel/blob';
import { LocalFileStorage } from './local-storage';

/**
 * Generic blob storage utility for JSON data
 * Automatically falls back to local file storage in development when no blob token is available
 */

export class BlobStorage<T extends { id: string }> {
  private fileName: string;
  private blobUrl: string | null = null;
  private localStorage: LocalFileStorage<T>;
  private useLocal: boolean = false;

  constructor(fileName: string) {
    this.fileName = fileName;
    this.localStorage = new LocalFileStorage<T>(fileName);
    
    // Check if we should use local storage (no blob token available)
    this.useLocal = !process.env.BLOB_READ_WRITE_TOKEN;
    
    if (this.useLocal) {
      console.log(`Using local file storage for ${fileName} (no BLOB_READ_WRITE_TOKEN found)`);
    }
  }

  /**
   * Get or create the blob URL
   */
  private async getBlobUrl(): Promise<string> {
    if (this.blobUrl) {
      return this.blobUrl;
    }

    try {
      // Check if file exists and get its URL
      const headResult = await head(this.fileName);
      this.blobUrl = headResult.url;
      return this.blobUrl;
    } catch (error) {
      if (error instanceof BlobNotFoundError) {
        // File doesn't exist yet, we'll create it on first write
        return '';
      }
      throw error;
    }
  }

  /**
   * Read data from storage (blob or local file)
   */
  async read(): Promise<T[]> {
    if (this.useLocal) {
      return this.localStorage.read();
    }

    try {
      const url = await this.getBlobUrl();
      if (!url) {
        // File doesn't exist yet
        return [];
      }
      
      // Fetch the blob content
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch blob: ${response.statusText}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error instanceof BlobNotFoundError) {
        // File doesn't exist yet, return empty array
        return [];
      }
      console.error('Error reading from blob storage:', error);
      return [];
    }
  }

  /**
   * Write data to storage (blob or local file)
   */
  async write(data: T[]): Promise<void> {
    if (this.useLocal) {
      return this.localStorage.write(data);
    }

    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      const result = await put(this.fileName, blob, {
        access: 'public',
        addRandomSuffix: false, // Keep consistent filename
        allowOverwrite: true,   // Allow overwriting existing files
      });
      
      // Update our cached URL
      this.blobUrl = result.url;
      
      console.log(`Data written to blob storage: ${this.fileName}`);
    } catch (error) {
      console.error('Error writing to blob storage:', error);
      throw error;
    }
  }

  /**
   * Add a new item to the storage
   */
  async add(item: T): Promise<void> {
    const data = await this.read();
    data.unshift(item); // Add to beginning
    await this.write(data);
  }

  /**
   * Update an item in the storage
   */
  async update(predicate: (item: T) => boolean, updateData: Partial<T>): Promise<T | null> {
    const data = await this.read();
    const index = data.findIndex(predicate);
    
    if (index === -1) return null;
    
    data[index] = { ...data[index], ...updateData };
    await this.write(data);
    return data[index];
  }

  /**
   * Delete an item from the storage
   */
  async delete(predicate: (item: T) => boolean): Promise<boolean> {
    const data = await this.read();
    const initialLength = data.length;
    const filteredData = data.filter(item => !predicate(item));
    
    if (filteredData.length < initialLength) {
      await this.write(filteredData);
      return true;
    }
    
    return false;
  }

  /**
   * Find a single item
   */
  async findOne(predicate: (item: T) => boolean): Promise<T | undefined> {
    const data = await this.read();
    return data.find(predicate);
  }

  /**
   * Find multiple items
   */
  async findMany(predicate: (item: T) => boolean): Promise<T[]> {
    const data = await this.read();
    return data.filter(predicate);
  }
}
