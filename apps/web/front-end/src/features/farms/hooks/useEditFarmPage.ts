import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createFarmSchema, type CreateFarmInput } from '../schemas/farm.schema'
import { farmService } from '@/services/farmService'
import type { ToastType } from '@/components/feedback/Toast'

export interface FarmToast {
  type: ToastType
  title: string
  message?: string
}

export function useEditFarmPage() {
  const navigate = useNavigate()
  const { farmId, id } = useParams<{ farmId?: string; id?: string }>()
  const effectiveId = farmId || id || ''

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
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

  // Fetch initial farm data
  useEffect(() => {
    if (!effectiveId || effectiveId === 'farm-1') {
      setIsLoading(false)
      return
    }

    let isMounted = true
    farmService
      .getById(effectiveId)
      .then((farm) => {
        if (!isMounted) return
        if (farm) {
          setFormData({
            name: farm.name || '',
            location: farm.location || '',
            description: farm.description || '',
            imageUrl: farm.imageUrl || '',
            status: farm.status === 'Aktif' ? 'Aktif' : 'Inaktif',
            gpsCoordinates: farm.gpsCoordinates || '-8.591200, 114.283100',
            additionalNotes: farm.additionalNotes || '',
          })
          if (farm.imageUrl) {
            setImagePreview(farm.imageUrl)
          }
        }
        setIsLoading(false)
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false)
          setToast({
            type: 'error',
            title: 'Gagal Memuat Data',
            message: 'Tidak dapat mengambil detail data kebun.',
          })
        }
      })

    return () => {
      isMounted = false
    }
  }, [effectiveId])

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
      const objectUrl = URL.createObjectURL(file)
      setImagePreview(objectUrl)
      setFormData((prev) => ({ ...prev, imageUrl: objectUrl }))
      if (errors.imageUrl) {
        setErrors((prev) => ({ ...prev, imageUrl: undefined }))
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!effectiveId) return

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
      await farmService.update(effectiveId, {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        status: formData.status,
        imageUrl: formData.imageUrl || undefined,
        gpsCoordinates: formData.gpsCoordinates || undefined,
        additionalNotes: formData.additionalNotes || undefined,
        foto: selectedFile || undefined,
      })

      // Navigasi kembali dengan flash state toast untuk notifikasi sukses
      navigate('/admin/farms', {
        state: {
          toast: {
            type: 'success',
            title: 'Perubahan Disimpan',
            message: `Data kebun "${formData.name}" berhasil diperbarui.`,
          },
        },
      })
    } catch (err: unknown) {
      setToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err instanceof Error ? err.message : 'Terjadi kesalahan saat mengupdate kebun.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    farmId: effectiveId,
    formData,
    errors,
    imagePreview,
    isLoading,
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
