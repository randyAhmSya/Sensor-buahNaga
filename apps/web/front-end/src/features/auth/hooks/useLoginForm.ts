import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { USER_ROLES } from '@/config/constants'
import { sanitizeInput } from '@/utils/sanitize'
import { loginSchema } from '../schemas/authSchemas'

export function useLoginForm() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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
    (e: FormEvent) => {
      e.preventDefault()
      setErrors({})

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

      login(
        {
          id: 'USR-BWI-001',
          name: 'Pengelola Kebun',
          email: result.data.email,
          role: USER_ROLES.SUPER_ADMIN,
          tenantId: 'TNT-AGR-0091',
        },
        'mock-jwt-token-agrolight-2026'
      )
      navigate('/admin/dashboard')
    },
    [formData, login, navigate]
  )

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
  }
}
