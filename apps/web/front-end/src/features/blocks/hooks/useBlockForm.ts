import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { blockFormSchema, type BlockFormInput } from '../schemas/block.schema'
import { blockService } from '@/services/blockService'
import { blockKeys, farmKeys } from '@/services/queryKeys'
import { compressImageFile } from '@/utils/imageCompressor'
import { useNotify } from '@/context/NotificationContext'

export const useBlockForm = (
  farmId: string,
  initialData?: BlockFormInput,
  isEdit = false,
  blockId?: string
) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const notify = useNotify()
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const updateField = (field: keyof BlockFormInput, value: string) => {
    let nextValue = value
    if (field === 'area') {
      nextValue = value.replace(/[^\d.]/g, '')
    }
    setFormData((prev) => ({ ...prev, [field]: nextValue }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const setStatus = (status: 'Online' | 'Offline') => {
    setFormData((prev) => ({ ...prev, status }))
  }

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const payloadWithFile = {
        name: parsed.data.name,
        nodeSensor: parsed.data.nodeSensor,
        description: parsed.data.description,
        status: parsed.data.status,
        area: parsed.data.area || undefined,
        harvestEstimate: parsed.data.harvestEstimate || undefined,
        imageUrl: parsed.data.imageUrl || undefined,
        foto: selectedFile || undefined,
      }

      if (isEdit && blockId) {
        await blockService.update(farmId, blockId, payloadWithFile)
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: blockKeys.all, refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: blockKeys.list(farmId), refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: farmKeys.withBlocks(), refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: farmKeys.detail(farmId), refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['kebun'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
        ])
        notify.success('Blok Diperbarui', `Data blok "${parsed.data.name}" berhasil diperbarui.`)
        navigate(`/kebun/farms/${farmId}/blocks/${blockId}`)
      } else {
        await blockService.create(farmId, payloadWithFile)
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: blockKeys.all, refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: blockKeys.list(farmId), refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: farmKeys.withBlocks(), refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: farmKeys.detail(farmId), refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['kebun'], refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
        ])
        notify.success('Blok Dibuat', `Blok "${parsed.data.name}" berhasil ditambahkan ke kebun.`)
        navigate(`/kebun/farms/${farmId}`)
      }
    } catch (err: unknown) {
      notify.error(
        isEdit ? 'Gagal Memperbarui Blok' : 'Gagal Membuat Blok',
        (err as Error)?.message || 'Terjadi kesalahan pada sistem saat menyimpan data blok.'
      )
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
