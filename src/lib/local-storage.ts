import { NewsArticle } from '@/types'
import { promises as fs } from 'fs'
import path from 'path'

export class LocalFileStorage<T extends { id: string }> {
  private fileName: string

  constructor(fileName: string) {
    this.fileName = fileName
  }

  private getFilePath(): string {
    return path.join(process.cwd(), 'data', path.basename(this.fileName))
  }

  async read(): Promise<T[]> {
    try {
      const filePath = this.getFilePath()
      const fileContent = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(fileContent)
    } catch (error) {
      console.log(`Local file ${this.fileName} not found, returning empty array`)
      return []
    }
  }

  async write(data: T[]): Promise<void> {
    try {
      const filePath = this.getFilePath()
      const dir = path.dirname(filePath)
      
      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true })
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2))
      console.log(`Data written to local file: ${filePath}`)
    } catch (error) {
      console.error('Error writing to local file:', error)
      throw error
    }
  }

  async add(item: T): Promise<void> {
    const data = await this.read()
    data.unshift(item) // Add to beginning
    await this.write(data)
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
      return false
    }

    await this.write(filteredData)
    return true
  }

  async findOne(predicate: (item: T) => boolean): Promise<T | undefined> {
    const data = await this.read()
    return data.find(predicate)
  }

  async findMany(predicate: (item: T) => boolean): Promise<T[]> {
    const data = await this.read()
    return data.filter(predicate)
  }
}
