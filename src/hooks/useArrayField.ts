import { useCallback } from 'react'

/**
 * Custom hook for managing array fields in forms
 * Provides add, remove, and update operations for array data
 */
export function useArrayField<T>(
  currentArray: T[],
  onUpdate: (newArray: T[]) => void
) {
  const add = useCallback((item: T) => {
    const newArray = [...currentArray, item]
    onUpdate(newArray)
  }, [currentArray, onUpdate])

  const remove = useCallback((index: number) => {
    const newArray = currentArray.filter((_, i) => i !== index)
    onUpdate(newArray)
  }, [currentArray, onUpdate])

  const update = useCallback((index: number, updates: Partial<T>) => {
    const newArray = currentArray.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    )
    onUpdate(newArray)
  }, [currentArray, onUpdate])

  const replace = useCallback((newArray: T[]) => {
    onUpdate(newArray)
  }, [onUpdate])

  const clear = useCallback(() => {
    onUpdate([])
  }, [onUpdate])

  return {
    add,
    remove,
    update,
    replace,
    clear,
    items: currentArray,
    length: currentArray.length
  }
}

/**
 * Specialized hook for managing string arrays (like activities, facilities)
 * Provides convenient methods for string manipulation
 */
export function useStringArrayField(
  currentArray: string[],
  onUpdate: (newArray: string[]) => void
) {
  const arrayField = useArrayField(currentArray, onUpdate)

  const addString = useCallback((value: string) => {
    const trimmedValue = value.trim()
    if (trimmedValue && !currentArray.includes(trimmedValue)) {
      arrayField.add(trimmedValue)
      return true
    }
    return false
  }, [arrayField, currentArray])

  const removeString = useCallback((value: string) => {
    const index = currentArray.indexOf(value)
    if (index >= 0) {
      arrayField.remove(index)
      return true
    }
    return false
  }, [arrayField, currentArray])

  const updateString = useCallback((index: number, newValue: string) => {
    const trimmedValue = newValue.trim()
    if (trimmedValue) {
      arrayField.update(index, trimmedValue as any) // Cast needed for string type
      return true
    }
    return false
  }, [arrayField])

  return {
    ...arrayField,
    addString,
    removeString,
    updateString,
    contains: (value: string) => currentArray.includes(value),
    isEmpty: currentArray.length === 0
  }
}
