import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createFarmSchema, type CreateFarmInput } from '../schemas/farm.schema'
import type { FarmItem } from '@/types/farm.types'
import { farmService } from '@/services/farmService'

interface UseCreateFarmPageProps {
  onAddFarm?: (farm: FarmItem) => void
}

export function useCreateFarmPage({ onAddFarm }: UseCreateFarmPageProps = {}) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [formData, setFormData] = useState<CreateFarmInput>({
    name: '',
    location: '',
    description: '',
    imageUrl: '',
    status: 'Aktif',
    gpsCoordinates: '-8.591200, 114.283100',
    additionalNotes: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CreateFarmInput, string>>>({})
  const [imagePreview, setImagePreview] = useState<string>('')

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

  const handleImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const dummyUrl = URL.createObjectURL(file)
      setImagePreview(dummyUrl)
      setFormData((prev) => ({ ...prev, imageUrl: dummyUrl }))
      if (errors.imageUrl) {
        setErrors((prev) => ({ ...prev, imageUrl: undefined }))
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const result = createFarmSchema.safeParse(formData)

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CreateFarmInput, string>> = {}
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof CreateFarmInput] = err.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await farmService.create({
        name: formData.name,
        location: formData.location,
        status: formData.status,
        foto: selectedFile || undefined,
      })
      if (onAddFarm && res.farm) {
        onAddFarm(res.farm)
      }
      navigate('/kebun/farms')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    errors,
    imagePreview,
    isSubmitting,
    handleTextChange,
    setStatus,
    handleImageFile,
    handleSubmit,
    setImagePreview,
  }
}

export const useFarmForm = useCreateFarmPage
