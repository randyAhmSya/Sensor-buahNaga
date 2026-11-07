import { useState, useRef, useEffect, type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu,
  HelpCircle,
  ChevronDown,
  Settings,
  LayoutDashboard,
  LogOut,
  CreditCard,
} from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { authService } from '@/services/authService'
import { NotificationPopover } from '@/components/common/NotificationPopover'
import { DebouncedSearchInput } from '@/components/common/DebouncedSearchInput'
import { UserAvatar } from '@/components/common/UserAvatar'
import { useSaasMode } from '@/context/SaasContext'
import { useNotify } from '@/context/NotificationContext'

interface SuperAdminTopBarProps {
  onOpenMobileSidebar: () => void
}

export const SuperAdminTopBar: FC<SuperAdminTopBarProps> = ({ onOpenMobileSidebar }) => {
  const navigate = useNavigate()
  const { user: authUser, logout } = useAuthStore()
  const { isSaasEnabled, toggleSaasMode } = useSaasMode()
  const notify = useNotify()

  const userName = authUser?.name || 'Super Admin'
  const userEmail = authUser?.email || 'admin@agrolight.com'
  const userAvatar = authUser?.avatarUrl || null

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    try {
      await authService.logout()
    } catch {
      // Abaikan error jaringan saat logout
    }
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Sisi Kiri: Tombol Menu Mobile & Search input rounded-full */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" strokeWidth={1.75} />
        </button>

        {/* Search input rounded-full */}
        <div className="w-full">
          <DebouncedSearchInput
            onDebouncedChange={(val) => {
              if (val.trim()) {
                console.log('TopBar search debounced:', val)
              }
            }}
            delay={1000}
            placeholder="Cari tenant, kebun, sensor..."
            ariaLabel="Pencarian global sistem"
            className="rounded-full bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white border-transparent"
          />
        </div>
      </div>

      {/* Sisi Kanan: Bantuan, Notifikasi, Avatar Profile */}
      <div className="flex items-center gap-3">
        {/* Tombol Bantuan */}
        <button
          type="button"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Bantuan dan Panduan"
          title="Bantuan dan Panduan"
        >
          <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" strokeWidth={1.75} />
        </button>

        {/* Komponen Notifikasi Popover */}
        <NotificationPopover role="super_admin" />

        {/* Toggle Mode SaaS (Utilitarian) */}
        <button
          type="button"
          onClick={() => {
            toggleSaasMode()
            if (isSaasEnabled) {
              notify.info(
                'Mode SaaS Dinonaktifkan',
                'Fitur langganan dan transaksi pembayaran disembunyikan untuk Sempro.'
              )
            } else {
              notify.success(
                'Mode SaaS Diaktifkan',
                'Seluruh fitur paket langganan dan verifikasi transaksi kini ditampilkan.'
              )
            }
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer select-none active:scale-98 ${
            isSaasEnabled
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
              : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
          }`}
          title="Klik untuk mengubah status fitur langganan (SaaS)"
        >
          <CreditCard className="w-3.5 h-3.5 shrink-0" />
          <span>Fitur SaaS:</span>
          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
              isSaasEnabled
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-300 text-slate-800'
            }`}
          >
            {isSaasEnabled ? 'ON' : 'OFF'}
          </span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Avatar Admin & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Menu profil Super Admin"
            aria-expanded={isDropdownOpen}
          >
            <UserAvatar
              src={userAvatar}
              name={userName}
              className="w-9 h-9 border-slate-200 shadow-2xs"
              theme="light"
            />
            <div className="hidden lg:block text-left pr-1">
              <p className="text-xs font-bold text-slate-900 leading-tight">{userName}</p>
              <p className="text-[10px] text-emerald-600 font-semibold leading-tight">Super Admin</p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              strokeWidth={1.75}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>
                <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SUPER_ADMIN
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/admin/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
                  <span>Pengaturan Akun</span>
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
                  <span>Dashboard Utama</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500 shrink-0" strokeWidth={1.75} />
                  <span>Keluar / Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default SuperAdminTopBar
