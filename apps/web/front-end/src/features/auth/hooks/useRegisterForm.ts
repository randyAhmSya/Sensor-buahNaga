import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { sanitizeInput } from '@/utils/sanitize'
import { registerSchema } from '../schemas/authSchemas'
import { authService } from '@/services/authService'
import { ApiError } from '@/services/api'
import { useAuthStore, mapBackendUserToUserProfile } from '@/store/useAuthStore'

export function useRegisterForm() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const [formData, setFormData] = useState({
    tenantName: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    let cleanValue = value
    let fieldError: string | undefined = undefined

    if (name === 'fullName') {
      cleanValue = value.replace(/[^a-zA-Z\s.,'-]/g, '')
      if (value !== cleanValue) {
        fieldError = 'Hanya huruf, spasi, titik, koma, tanda hubung, dan petik satu diperbolehkan'
      }
    } else if (name === 'phone') {
      cleanValue = value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
      if (value !== cleanValue) {
        fieldError = 'Hanya angka dan tanda + di awal diperbolehkan'
      }
    } else if (name === 'email') {
      cleanValue = value.replace(/[\s<>"'/`]/g, '')
      if (value !== cleanValue) {
        fieldError = 'Spasi dan karakter berbahaya tidak diizinkan pada email'
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : cleanValue,
    }))
    setGeneralError(null)
    setErrors((prev) => {
      if (fieldError) {
        return { ...prev, [name]: fieldError }
      }
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      setGeneralError(null)

      const sanitizedData = {
        tenantName: sanitizeInput(formData.tenantName),
        fullName: sanitizeInput(formData.fullName),
        email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        agreedToTerms: formData.agreedToTerms,
      }

      const result = registerSchema.safeParse(sanitizedData)
      if (!result.success) {
        const fieldErrors: Record<string, string> = {}
        for (const issue of result.error.issues) {
          const field = issue.path[0] as string
          if (!fieldErrors[field]) {
            fieldErrors[field] = issue.message
          }
        }
        setErrors(fieldErrors)
        return
      }

      setIsSubmitting(true)
      try {
        const res = await authService.register({
          nama_tenant: result.data.tenantName,
          nama_lengkap: result.data.fullName,
          email: result.data.email,
          password: result.data.password,
          password_confirmation: result.data.confirmPassword,
        })

        if (res && res.data && res.data.user && res.data.token) {
          const profile = mapBackendUserToUserProfile(res.data.user)
          login(profile, res.data.token)
          navigate('/kebun/farms')
        } else {
          navigate('/login')
        }
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setGeneralError(err.pesan || 'Registrasi gagal. Silakan coba lagi.')
          if (err.errors) {
            const fieldErrs: Record<string, string> = {}
            for (const [key, msgs] of Object.entries(err.errors)) {
              // Map Laravel backend validation keys to frontend field names
              const mappedKey = key === 'nama_tenant' ? 'tenantName'
                : key === 'nama_lengkap' ? 'fullName'
                : key === 'password_confirmation' ? 'confirmPassword'
                : key
              fieldErrs[mappedKey] = msgs[0]
            }
            setErrors(fieldErrs)
          }
        } else {
          setGeneralError((err as Error)?.message || 'Terjadi gangguan koneksi.')
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, login, navigate]
  )

  return {
    formData,
    errors,
    generalError,
    isSubmitting,
    handleChange,
    handleSubmit,
  }
}
