import React from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Phone, Lock, ArrowRight, Building2, AlertCircle } from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'
import { Button } from '@/components/ui/Button'
import { InputField } from '@/components/form/InputField'
import { AuthSideBanner } from '../components/AuthSideBanner'
import { useRegisterForm } from '../hooks/useRegisterForm'

export const RegisterPage: React.FC = () => {
  const { formData, errors, generalError, isSubmitting, handleChange, handleSubmit } = useRegisterForm()

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 font-sans">
      <AuthSideBanner
        title="Kelola kebun buah naga Anda lebih efisien"
        description="Satu dasbor presisi untuk memantau siklus penyinaran malam hari, mengontrol lampu otomatis, dan mengestimasikan waktu panen secara akurat."
        highlights={[
          'Coba gratis 14 hari penuh tanpa komitmen',
          'Kalkulasi masa aktif transparan tanpa auto-debit',
        ]}
      />

      {/* Form Kanan */}
      <div className="w-full md:w-[55%] flex flex-col justify-center items-center p-6 md:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <div className="md:hidden mb-6">
            <BrandLogo variant="dark" />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Daftarkan Kebun Anda</h2>
            <p className="text-sm text-slate-500 mt-1">Coba gratis 14 hari pertama, tanpa kartu kredit.</p>
          </div>

          {generalError && (
            <div className="mb-4 p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Nama Kebun / Usaha Tani"
              name="tenantName"
              placeholder="Contoh: Kebun Naga Makmur"
              value={formData.tenantName}
              onChange={handleChange}
              leftIcon={<Building2 className="w-5 h-5 text-slate-400" />}
              error={errors.tenantName}
              required
            />

            <InputField
              label="Nama Lengkap"
              name="fullName"
              placeholder="Masukkan nama lengkap"
              value={formData.fullName}
              onChange={handleChange}
              leftIcon={<User className="w-5 h-5 text-slate-400" />}
              error={errors.fullName}
              required
            />

            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<Mail className="w-5 h-5 text-slate-400" />}
              error={errors.email}
              required
            />

            <InputField
              label="Nomor Telepon"
              name="phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={formData.phone}
              onChange={handleChange}
              leftIcon={<Phone className="w-5 h-5 text-slate-400" />}
              error={errors.phone}
              required
            />

            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 8 karakter (huruf & angka)"
              value={formData.password}
              onChange={handleChange}
              leftIcon={<Lock className="w-5 h-5 text-slate-400" />}
              error={errors.password}
              required
            />

            <InputField
              label="Konfirmasi Password"
              name="confirmPassword"
              type="password"
              placeholder="Ketik ulang password"
              value={formData.confirmPassword}
              onChange={handleChange}
              leftIcon={<Lock className="w-5 h-5 text-slate-400" />}
              error={errors.confirmPassword}
              required
            />

            <div className="pt-1">
              <div className="flex items-start gap-2.5">
                <input
                  id="terms"
                  name="agreedToTerms"
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                  Saya menyetujui{' '}
                  <a href="#" className="font-semibold text-emerald-700 hover:underline">
                    Syarat & Ketentuan
                  </a>{' '}
                  serta{' '}
                  <a href="#" className="font-semibold text-emerald-700 hover:underline">
                    Kebijakan Privasi
                  </a>
                </label>
              </div>
              {errors.agreedToTerms && (
                <p className="text-xs text-rose-600 font-medium mt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                  {errors.agreedToTerms}
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 mt-2 shadow-sm rounded-xl active:scale-[0.98] transition-all duration-150 cursor-pointer"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Buat Akun
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage