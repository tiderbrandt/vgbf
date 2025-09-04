import { put, head, BlobNotFoundError } from '@vercel/blob';

/**
 * Generic blob storage utility for JSON data
 * This replaces filesystem-based storage for Vercel deployment
 */

export class BlobStorage<T> {
  private fileName: string;
  private blobUrl: string | null = null;

  constructor(fileName: string) {
    this.fileName = fileName;
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
   * Read data from blob storage
   */
  async read(): Promise<T[]> {
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
   * Write data to blob storage
   */
  async write(data: T[]): Promise<void> {
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
