import { useState, useCallback } from 'react'

/**
 * Generic hook for managing form state
 * Provides type-safe form state management with validation support
 */
export function useFormState<T extends Record<string, any>>(
  initialState: T,
  validator?: (data: T) => Record<string, string>
) {
  const [formData, setFormData] = useState<T>(initialState)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = useCallback(<K extends keyof T>(
    field: K,
    value: T[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field as string]
        return newErrors
      })
    }
  }, [errors])

  const updateFields = useCallback((updates: Partial<T>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }))
  }, [])

  const validate = useCallback(() => {
    if (!validator) return true
    
    const validationErrors = validator(formData)
    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }, [formData, validator])

  const reset = useCallback((newState?: T) => {
    setFormData(newState || initialState)
    setErrors({})
    setIsSubmitting(false)
  }, [initialState])

  const submit = useCallback(async (
    onSubmit: (data: T) => Promise<void> | void
  ) => {
    if (!validate()) return false
    
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      return true
    } catch (error) {
      console.error('Form submission error:', error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, validate])

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateFields,
    validate,
    reset,
    submit,
    hasErrors: Object.keys(errors).length > 0,
    isValid: Object.keys(errors).length === 0
  }
}
