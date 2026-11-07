import { useState, useCallback, type FC, type ChangeEvent, type FormEvent } from 'react'
import { ShieldCheck, Lock } from 'lucide-react'
import { InputField } from '@/components/form/InputField'
import { Button } from '@/components/ui/Button'
import { changePasswordSchema } from '../schemas/profileSchemas'
import { useNotify } from '@/context/NotificationContext'

export const SecuritySection: FC = () => {
  const notify = useNotify()
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswords((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (!prev[name]) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }, [])

  const handlePasswordSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()

      const result = changePasswordSchema.safeParse(passwords)
      if (!result.success) {
        const fieldErrors: Record<string, string> = {}
        for (const issue of result.error.issues) {
          const fieldName = issue.path[0] as string
          if (fieldName && !fieldErrors[fieldName]) {
            fieldErrors[fieldName] = issue.message
          }
        }
        setErrors(fieldErrors)
        return
      }

      setErrors({})
      notify.success('Keamanan Akun', 'Password berhasil diperbarui!')
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    },
    [passwords, notify]
  )

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <ShieldCheck className="w-5 h-5 text-emerald-700" />
        <h2 className="text-lg font-bold text-slate-900">Keamanan</h2>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
        <InputField
          label="Password Lama"
          name="currentPassword"
          type="password"
          placeholder="••••••••"
          value={passwords.currentPassword}
          onChange={handleChange}
          leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
          error={errors.currentPassword}
          required
        />

        <InputField
          label="Password Baru"
          name="newPassword"
          type="password"
          placeholder="Minimal 8 karakter (huruf besar, kecil, angka)"
          value={passwords.newPassword}
          onChange={handleChange}
          leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
          error={errors.newPassword}
          required
        />

        <InputField
          label="Konfirmasi Password Baru"
          name="confirmPassword"
          type="password"
          placeholder="Ulangi password baru"
          value={passwords.confirmPassword}
          onChange={handleChange}
          leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
          error={errors.confirmPassword}
          required
        />

        <div className="pt-2 flex justify-start">
          <Button
            type="submit"
            variant="outline"
            size="md"
            className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            Ubah Password
          </Button>
        </div>
      </form>
    </div>
  )
}
