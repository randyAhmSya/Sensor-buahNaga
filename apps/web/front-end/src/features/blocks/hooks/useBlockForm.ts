import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { blockFormSchema, type BlockFormInput } from '../schemas/block.schema'
import { blockService } from '@/services/blockService'
import { sanitizeInput } from '@/utils/sanitize'

export const useBlockForm = (
  farmId: string,
  initialData?: BlockFormInput,
  isEdit = false,
  blockId?: string
) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<BlockFormInput>(
    initialData || {
      name: '',
      nodeSensor: '',
      description: '',
      imageUrl: '',
      status: 'Online',
      area: '',
      harvestEstimate: '',
    }
  )
  const [errors, setErrors] = useState<Partial<Record<keyof BlockFormInput, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>(initialData?.imageUrl || '')

  const updateField = (field: keyof BlockFormInput, value: string) => {
    let cleaned = sanitizeInput(value)
    if (field === 'area') {
      cleaned = value.replace(/[^\d.]/g, '')
    }
    setFormData((prev) => ({ ...prev, [field]: cleaned }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const setStatus = (status: 'Online' | 'Offline') => {
    setFormData((prev) => ({ ...prev, status }))
  }

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const dummyUrl = URL.createObjectURL(file)
      setImagePreview(dummyUrl)
      setFormData((prev) => ({ ...prev, imageUrl: dummyUrl }))
      if (errors.imageUrl) {
        setErrors((prev) => ({ ...prev, imageUrl: undefined }))
      }
    }
  }

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const parsed = blockFormSchema.safeParse(formData)

    if (!parsed.success) {
      const errMap: Partial<Record<keyof BlockFormInput, string>> = {}
      parsed.error.issues.forEach((err) => {
        if (err.path[0]) {
          errMap[err.path[0] as keyof BlockFormInput] = err.message
        }
      })
      setErrors(errMap)
      return
    }

    setIsSubmitting(true)
    try {
      if (isEdit && blockId) {
        await blockService.update(farmId, blockId, parsed.data)
        navigate(`/admin/farms/${farmId}/blocks/${blockId}`)
      } else {
        await blockService.create(farmId, parsed.data)
        navigate(`/admin/farms/${farmId}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    errors,
    isSubmitting,
    imagePreview,
    setImagePreview,
    updateField,
    setStatus,
    handleImageFile,
    submit,
  }
}
