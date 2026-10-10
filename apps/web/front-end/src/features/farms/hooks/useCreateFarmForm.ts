import { useState, type FormEvent } from 'react'
import { createFarmSchema, type CreateFarmInput } from '../schemas/farmSchema'
import type { FarmItem } from '@/types/farm'

const INITIAL_FORM: CreateFarmInput = {
  name: '',
  description: '',
  location: '',
  imageUrl: '',
  status: 'Aktif',
}

interface UseCreateFarmFormProps {
  onAddFarm: (newFarm: FarmItem) => void
  onClose: () => void
}

export function useCreateFarmForm({ onAddFarm, onClose }: UseCreateFarmFormProps) {
  const [formData, setFormData] = useState<CreateFarmInput>(INITIAL_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof CreateFarmInput, string>>>({})

  const handleTextChange = (field: keyof CreateFarmInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const setStatus = (status: 'Aktif' | 'Inaktif') => {
    setFormData((prev) => ({ ...prev, status }))
    if (errors.status) {
      setErrors((prev) => ({ ...prev, status: undefined }))
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const result = createFarmSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CreateFarmInput, string>> = {}
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof CreateFarmInput] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    const newFarmItem: FarmItem = {
      id: `farm-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      location: formData.location,
      status: formData.status,
      totalBlocks: 0,
      imageUrl: formData.imageUrl || '',
      bannerUrl: formData.imageUrl || '',
      blocks: [],
    }

    onAddFarm(newFarmItem)
    setFormData(INITIAL_FORM)
    setErrors({})
    onClose()
  }

  return {
    formData,
    errors,
    handleTextChange,
    setStatus,
    handleSubmit,
  }
}
