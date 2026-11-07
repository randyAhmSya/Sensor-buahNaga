import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { createFarmSchema, type CreateFarmInput } from '../schemas/farm.schema'
import type { FarmItem } from '@/types/farm.types'
import { farmService } from '@/services/farmService'
import { farmKeys } from '@/services/queryKeys'
import { ApiError } from '@/services/api'
import type { ToastType } from '@/components/feedback/Toast'
import { compressImageFile } from '@/utils/imageCompressor'
import { useNotify } from '@/context/NotificationContext'

export interface FarmToast {
  type: ToastType
  title: string
  message?: string
}

interface UseCreateFarmPageProps {
  onAddFarm?: (farm: FarmItem) => void
}

export function useCreateFarmPage({ onAddFarm }: UseCreateFarmPageProps = {}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const notify = useNotify()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [toast, setToast] = useState<FarmToast | null>(null)

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

  const handleImageFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const optimizedFile = await compressImageFile(file)
      setSelectedFile(optimizedFile)
      const previewUrl = URL.createObjectURL(optimizedFile)
      setImagePreview(previewUrl)
      setFormData((prev) => ({ ...prev, imageUrl: previewUrl }))
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
      const fileToUpload = selectedFile ? await compressImageFile(selectedFile) : undefined
      const res = await farmService.create({
        name: formData.name,
        location: formData.location,
        status: formData.status,
        foto: fileToUpload,
      })
      if (res.farm) {
        queryClient.setQueryData<FarmItem[]>(['kebun'], (old = []) => [res.farm, ...(old || [])])
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['kebun'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.withBlocks(), refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
      ])
      if (onAddFarm && res.farm) {
        onAddFarm(res.farm)
      }
      notify.success('Kebun Berhasil Dibuat', `Kebun "${formData.name}" berhasil ditambahkan.`)
      navigate('/kebun/farms')
    } catch (err: unknown) {
      let errorMessage = 'Terjadi kesalahan saat menambahkan kebun baru.'
      if (err instanceof ApiError) {
        errorMessage = err.pesan || err.message
        if (err.errors) {
          const backendFieldErrors: Partial<Record<keyof CreateFarmInput, string>> = {}
          for (const [key, msgs] of Object.entries(err.errors)) {
            if (key in formData && msgs && msgs.length > 0) {
              backendFieldErrors[key as keyof CreateFarmInput] = msgs[0]
            }
          }
          if (Object.keys(backendFieldErrors).length > 0) {
            setErrors((prev) => ({ ...prev, ...backendFieldErrors }))
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      notify.error('Gagal Menyimpan Kebun', errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    errors,
    imagePreview,
    isSubmitting,
    toast,
    setToast,
    handleTextChange,
    setStatus,
    handleImageFile,
    handleSubmit,
    setImagePreview,
  }
}

export const useFarmForm = useCreateFarmPage
