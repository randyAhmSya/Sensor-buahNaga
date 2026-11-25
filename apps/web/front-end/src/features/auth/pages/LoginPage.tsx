import type { FC } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/common/BrandLogo";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/form/InputField";
import { AuthSideBanner } from "../components/AuthSideBanner";
import { useLoginForm } from "../hooks/useLoginForm";
import { useAuthStore } from "@/store/useAuthStore";
import { USER_ROLES } from "@/config/constants";
import { authService } from "@/services/authService";

const PESAN_GOOGLE: Record<string, string> = {
  dibatalkan: "Login Google dibatalkan.",
  state_tidak_valid: "Sesi login Google kedaluwarsa. Silakan coba lagi.",
  gagal_google: "Tidak dapat terhubung ke Google. Silakan coba lagi.",
  email_belum_terverifikasi: "Email Google Anda belum terverifikasi.",
  superadmin_tidak_diizinkan:
    "Akun Super Admin wajib masuk dengan email dan password.",
  akun_nonaktif: "Akun ini dinonaktifkan. Hubungi admin AgroLight.",
  akun_google_berbeda: "Email ini sudah tertaut dengan akun Google yang lain.",
};

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.5 0 6.6 1.2 9.1 3.5l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"
    />
    <path
      fill="#FBBC05"
      d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
    />
  </svg>
);

export const LoginPage: FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();
  const kodeGoogleError = searchParams.get("google_error");
  const pesanGoogleError = kodeGoogleError
    ? PESAN_GOOGLE[kodeGoogleError] || "Login Google gagal. Silakan coba lagi."
    : null;
  const { formData, errors, isSubmitting, handleChange, handleSubmit } =
    useLoginForm();

  if (isAuthenticated && user) {
    if (user.profileComplete === false) {
      return <Navigate to="/lengkapi-profil" replace />;
    }
    if (user.role === USER_ROLES.SUPER_ADMIN) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/kebun/farms" replace />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 font-sans">
      <AuthSideBanner
        title="Selamat Datang Kembali di AgroLight"
        description="Pantau status node pencahayaan, lacak akumulasi lux harian, dan kelola jadwal lampu kebun buah naga Anda dalam satu kendali terpusat."
        highlights={[
          "Monitoring daya & efisiensi lampu secara real-time",
          "Prediksi panen presisi berbasis akumulasi durasi cahaya",
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
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Masuk ke Akun Anda
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Masukkan kredensial akun untuk mengakses dasbor kebun.
            </p>
          </div>

          {pesanGoogleError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
            >
              {pesanGoogleError}
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
              <a
                href="#"
                className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
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

          {/* Login Google */}
          <div className="flex items-center gap-3 my-5">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              atau
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <a
            href={authService.googleRedirectUrl()}
            className="flex items-center justify-center gap-3 w-full rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
          >
            <GoogleIcon />
            Masuk dengan Google
          </a>

          {/* Link ke Register */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
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
  );
};

export default LoginPage;
