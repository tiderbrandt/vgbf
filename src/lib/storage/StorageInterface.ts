/**
 * Generic storage interface for CRUD operations
 * Provides a consistent API across different storage implementations
 */
export interface StorageInterface<T> {
  /**
   * Read all items from storage
   */
  read(): Promise<T[]>

  /**
   * Write all items to storage (overwrites existing data)
   */
  write(data: T[]): Promise<void>

  /**
   * Add a new item to storage
   */
  add(item: T): Promise<T>

  /**
   * Update an item matching the predicate
   * @param predicate Function to find the item to update
   * @param updates Partial data to update
   * @returns Updated item or null if not found
   */
  update(predicate: (item: T) => boolean, updates: Partial<T>): Promise<T | null>

  /**
   * Delete an item matching the predicate
   * @param predicate Function to find the item to delete
   * @returns true if item was deleted, false if not found
   */
  delete(predicate: (item: T) => boolean): Promise<boolean>

  /**
   * Find a single item matching the predicate
   * @param predicate Function to find the item
   * @returns Found item or undefined
   */
  findOne(predicate: (item: T) => boolean): Promise<T | undefined>
}
