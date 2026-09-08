import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { sanitizeInput } from '@/utils/sanitize'
import { registerSchema } from '../schemas/authSchemas'

export function useRegisterForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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

      const sanitizedData = {
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

      setErrors({})
      navigate('/login')
    },
    [formData, navigate]
  )

  return {
    formData,
    errors,
    handleChange,
    handleSubmit,
  }
}
