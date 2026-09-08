import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, LogIn, CheckCircle2 } from 'lucide-react'
import { loginSchema, type LoginFormValues } from '../../../schemas/authSchema'
import { FormWrapper } from '../../../components/form/FormWrapper'
import { InputField } from '../../../components/form/InputField'
import { Button } from '../../../components/ui/Button'
import { useAuthStore } from '../../../store/useAuthStore'
import { ROLE_ADMIN } from '../../../config/constants'

export function LoginForm() {
  const [loginSuccess, setLoginSuccess] = useState(false)
  const login = useAuthStore((state) => state.login)

  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
    mode: 'onTouched',
  })

  const onSubmit = (data: LoginFormValues) => {
    // Simulasi autentikasi
    login(
      {
        id: 'USR-BWI-001',
        name: 'Bambang Sutrisno',
        email: data.email,
        role: ROLE_ADMIN,
        tenantId: 'TNT-AGR-0091',
      },
      'mock-jwt-token-agrolight-2026'
    )
    setLoginSuccess(true)
  }

  return (
    <div className="w-full">
      {loginSuccess ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center animate-in fade-in">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 mb-3" />
          <h4 className="text-lg font-bold text-emerald-900">Autentikasi Berhasil</h4>
          <p className="text-sm text-emerald-700 mt-1">
            Selamat datang di Dashboard AgroLight Buah Naga.
          </p>
        </div>
      ) : (
        <FormWrapper methods={methods} onSubmit={onSubmit} className="space-y-4">
          <InputField
            name="email"
            label="Alamat Email"
            type="email"
            placeholder="nama@perkebunan.id"
            leftIcon={<Mail className="h-4 w-4" />}
            required
          />

          <InputField
            name="password"
            label="Kata Sandi"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock className="h-4 w-4" />}
            required
          />

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                {...methods.register('rememberMe')}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span>Ingat sesi saya</span>
            </label>

            <a
              href="#lupa-sandi"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Lupa sandi?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={methods.formState.isSubmitting}
            rightIcon={<LogIn className="h-4 w-4" />}
          >
            Masuk ke Portal Kebun
          </Button>
        </FormWrapper>
      )}
    </div>
  )
}
