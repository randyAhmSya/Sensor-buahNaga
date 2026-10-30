import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, mapBackendUserToUserProfile } from '@/store/useAuthStore'
import { sanitizeInput } from '@/utils/sanitize'
import { loginSchema } from '../schemas/authSchemas'
import { authService } from '@/services/authService'
import { ApiError } from '@/services/api'
import { useNotify } from '@/context/NotificationContext'

export function useLoginForm() {
  const navigate = useNavigate()
  const notify = useNotify()
  const login = useAuthStore((state) => state.login)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    let cleanValue = value
    let fieldError: string | undefined = undefined

    if (name === 'email') {
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
      setErrors({})
      setGeneralError(null)

      const sanitizedData = {
        email: sanitizeInput(formData.email),
        password: formData.password,
        rememberMe: formData.rememberMe,
      }

      const result = loginSchema.safeParse(sanitizedData)
      if (!result.success) {
        const fieldErrors: Record<string, string> = {}
        result.error.issues.forEach((issue) => {
          const field = issue.path[0]
          if (field && !fieldErrors[field.toString()]) {
            fieldErrors[field.toString()] = issue.message
          }
        })
        setErrors(fieldErrors)
        return
      }

      setIsSubmitting(true)
      try {
        const res = await authService.login({
          email: result.data.email,
          password: result.data.password,
        })

        if (res && res.data && res.data.user && res.data.token) {
          const rawRole = res.data.role || res.data.user.role
          const profile = mapBackendUserToUserProfile({
            ...res.data.user,
            role: rawRole || res.data.user.role,
          })
          login(profile, res.data.token)

          const role = (res.data.role || res.data.user?.role || profile.role || '').toLowerCase()
          if (role === 'super_admin' || role === 'superadmin' || role.replace(/[-_\s]/g, '') === 'superadmin') {
            navigate('/admin')
          } else {
            navigate('/kebun/farms')
          }
        }
      } catch (err: unknown) {
        let msg = 'Terjadi kesalahan saat masuk.'
        if (err instanceof ApiError) {
          msg = err.pesan || 'Email atau password salah.'
          setGeneralError(msg)
          if (err.errors) {
            const fieldErrs: Record<string, string> = {}
            for (const [key, msgs] of Object.entries(err.errors)) {
              fieldErrs[key] = msgs[0]
            }
            setErrors(fieldErrs)
          }
        } else {
          msg = (err as Error)?.message || 'Terjadi kesalahan saat masuk.'
          setGeneralError(msg)
        }
        notify.error('Gagal Masuk', msg)
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, login, navigate, notify]
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
