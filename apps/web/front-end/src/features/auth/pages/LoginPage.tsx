import type { FC } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { 
  Mail, 
  Lock, 
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'
import { Button } from '@/components/ui/Button'
import { InputField } from '@/components/form/InputField'
import { AuthSideBanner } from '../components/AuthSideBanner'
import { useLoginForm } from '../hooks/useLoginForm'
import { useAuthStore } from '@/store/useAuthStore'
import { USER_ROLES } from '@/config/constants'

export const LoginPage: FC = () => {
  const { user, isAuthenticated } = useAuthStore()
  const { formData, errors, generalError, isSubmitting, handleChange, handleSubmit } = useLoginForm()

  if (isAuthenticated && user) {
    if (user.role === USER_ROLES.SUPER_ADMIN) {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/kebun/farms" replace />
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 font-sans">
      <AuthSideBanner
        title="Selamat Datang Kembali di AgroLight"
        description="Pantau status node pencahayaan, lacak akumulasi lux harian, dan kelola jadwal lampu kebun buah naga Anda dalam satu kendali terpusat."
        highlights={[
          'Monitoring daya & efisiensi lampu secara real-time',
          'Prediksi panen presisi berbasis akumulasi durasi cahaya',
        ]}
      />

      {/* Sisi Kanan: Form Login */}
      <div className="w-full md:w-[55%] flex flex-col justify-center items-center p-6 md:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          {/* Mobile Brand */}
          <div className="md:hidden mb-6">
            <BrandLogo variant="dark" />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Masuk ke Akun Anda</h2>
            <p className="text-sm text-slate-500 mt-1">Masukkan kredensial akun untuk mengakses dasbor kebun.</p>
          </div>

          {generalError && (
            <div className="mb-4 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <InputField
              label="Email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              error={errors.email}
            />

            {/* Password */}
            <InputField
              label="Password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 karakter"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              error={errors.password}
            />

            {/* Opsi Ingat Saya & Lupa Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                />
                <span>Ingat saya</span>
              </label>
              <a href="#" className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">
                Lupa kata sandi?
              </a>
            </div>

            {/* Tombol Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 mt-3 shadow-sm rounded-xl cursor-pointer active:scale-[0.98] transition-all duration-150"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Masuk
            </Button>
          </form>

          {/* Link ke Register */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
            Belum punya akun?{' '}
            <Link to="/register" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
              Daftar Sekarang
            </Link>
          </div>
        </div>

        {/* Minimal Footer for Mobile Context */}
        <div className="mt-8 text-center max-w-md w-full md:hidden">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} AgroLight Automation Systems.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
