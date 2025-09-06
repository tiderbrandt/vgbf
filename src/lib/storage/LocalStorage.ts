import fs from 'fs'
import path from 'path'
import { StorageInterface } from './StorageInterface'

/**
 * Local file storage implementation
 * Stores data in JSON files in the data/ directory
 */
export class LocalStorage<T extends { id: string }> implements StorageInterface<T> {
  private filePath: string

  constructor(private fileName: string) {
    this.filePath = path.join(process.cwd(), 'data', path.basename(fileName))
  }

  async read(): Promise<T[]> {
    try {
      const data = await fs.promises.readFile(this.filePath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.log(`Local file ${this.fileName} not found, returning empty array`)
      return []
    }
  }

  async write(data: T[]): Promise<void> {
    try {
      const dir = path.dirname(this.filePath)
      await fs.promises.mkdir(dir, { recursive: true })
      await fs.promises.writeFile(this.filePath, JSON.stringify(data, null, 2))
      console.log(`Data written to local file: ${this.filePath}`)
    } catch (error) {
      console.error('Error writing to local file:', error)
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
