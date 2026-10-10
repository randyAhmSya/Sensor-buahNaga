import { useState, useCallback, type FC, type ChangeEvent, type FormEvent } from 'react'
import { User, Mail, Phone, CheckCircle2 } from 'lucide-react'
import { InputField } from '@/components/form/InputField'
import { Button } from '@/components/ui/Button'
import { sanitizeInput } from '@/utils/sanitize'
import { profileInfoSchema } from '../schemas/profileSchemas'
import { useAuthStore } from '@/store/useAuthStore'
import { ProfileAvatar } from './ProfileAvatar'

export const ProfileInfoSection: FC = () => {
  const { user: authUser } = useAuthStore()
  const [formData, setFormData] = useState({
    fullName: authUser?.name || '',
    email: authUser?.email || '',
    phone: '',
    avatarUrl: authUser?.avatarUrl || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let cleanValue = value
    let fieldError: string | undefined = undefined

    if (name === 'fullName') {
      cleanValue = value.replace(/[^a-zA-Z\s.,'-]/g, '')
      if (value !== cleanValue) {
        fieldError = 'Hanya alfabet, spasi, dan tanda baca nama standar yang diizinkan'
      }
    } else if (name === 'email') {
      cleanValue = value.replace(/[\s<>"'/`]/g, '')
      if (value !== cleanValue) {
        fieldError = 'Spasi dan karakter berbahaya tidak diizinkan pada email'
      }
    } else if (name === 'phone') {
      cleanValue = value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')
      if (value !== cleanValue) {
        fieldError = 'Nomor telepon hanya boleh berisi angka dan diawali +'
      }
    }

    setFormData((prev) => ({ ...prev, [name]: cleanValue }))
    setSaveSuccess(false)
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
        phone: sanitizeInput(formData.phone).replace(/\s+/g, ''),
      }

      const result = profileInfoSchema.safeParse(sanitizedData)
      if (!result.success) {
        const fieldErrors: Record<string, string> = {}
        for (const issue of result.error.issues) {
          const fieldName = issue.path[0] as string
          if (fieldName && !fieldErrors[fieldName]) {
            fieldErrors[fieldName] = issue.message
          }
        }
        setErrors(fieldErrors)
        setSaveSuccess(false)
        return
      }

      setErrors({})
      setFormData((prev) => ({ ...prev, ...sanitizedData }))
      setSaveSuccess(true)
    },
    [formData]
  )

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <User className="w-5 h-5 text-emerald-700" />
        <h2 className="text-lg font-bold text-slate-900">Informasi Akun</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Avatar & Ganti Foto */}
        <ProfileAvatar avatarUrl={formData.avatarUrl} />

        {/* Form Biodata */}
        <form onSubmit={handleSubmit} className="flex-1 w-full space-y-4">
          {saveSuccess && (
            <div className="flex items-center gap-2 p-3 text-sm text-emerald-800 bg-white border border-emerald-300 rounded-xl animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Perubahan data profil berhasil disimpan!</span>
            </div>
          )}

          <InputField
            label="Nama Lengkap"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            error={errors.fullName}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              error={errors.email}
              required
            />
            <InputField
              label="Nomor Telepon"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              error={errors.phone}
              required
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
