import type { FC } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  X,
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  ShieldCheck,
  History,
  Settings,
  LogOut,
} from 'lucide-react'
import logoAgroLight from '@/assets/logo.png'
import { useAuthStore } from '@/store/useAuthStore'
import { authService } from '@/services/authService'
import { UserAvatar } from '@/components/common/UserAvatar'

interface SuperAdminSidebarProps {
  mobileSidebarOpen: boolean
  onClose: () => void
}

export const SuperAdminSidebar: FC<SuperAdminSidebarProps> = ({
  mobileSidebarOpen,
  onClose,
}) => {
  const navigate = useNavigate()
  const { user: authUser, logout } = useAuthStore()

  const userName = authUser?.name || 'Super Admin'
  const userAvatar = authUser?.avatarUrl || null

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // Abaikan error jaringan saat logout
    }
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={`
        fixed md:sticky top-0 left-0 h-screen w-[280px] bg-slate-900 text-slate-300 z-50 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out border-r border-slate-800
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Header */}
        <div className="h-20 px-6 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img src={logoAgroLight} alt="AgroLight Logo" className="w-8 h-8 object-contain shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold text-white tracking-tight">
                  Agro<span className="text-emerald-400">Light</span>
                </span>
              </div>
              <span className="text-[11px] font-medium text-emerald-400/90 block -mt-0.5 tracking-wide">
                Super Admin Console
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            aria-label="Tutup menu sidebar"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {/* 1. Dashboard */}
          <NavLink
            to="/admin"
            end
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.98]
              ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }
            `}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Dashboard</span>
          </NavLink>

          {/* 2. Manajemen Tenant */}
          <NavLink
            to="/admin/tenant"
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.98]
              ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }
            `}
          >
            <Building2 className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Manajemen Tenant</span>
          </NavLink>

          {/* 3. Kelola Pengguna */}
          <NavLink
            to="/admin/users"
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.98]
              ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }
            `}
          >
            <Users className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Kelola Pengguna</span>
          </NavLink>

          {/* 4. Transaksi & Paket */}
          <NavLink
            to="/admin/langganan"
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.98]
              ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }
            `}
          >
            <CreditCard className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Transaksi & Paket</span>
          </NavLink>

          {/* 5. Izin Akses Tenant */}
          <NavLink
            to="/admin/access-requests"
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.98]
              ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }
            `}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Izin Akses Tenant</span>
          </NavLink>

          {/* 6. Log Aktivitas Admin */}
          <NavLink
            to="/admin/log-aktivitas"
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.98]
              ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }
            `}
          >
            <History className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Log Aktivitas</span>
          </NavLink>

          {/* 7. Pengaturan */}
          <NavLink
            to="/admin/settings"
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.98]
              ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }
            `}
          >
            <Settings className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Pengaturan</span>
          </NavLink>
        </nav>
      </div>

      {/* User Section & Logout Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3 shrink-0">
        <div className="flex items-center gap-3 px-2 py-1">
          <UserAvatar
            src={userAvatar}
            name={userName}
            className="w-9 h-9 border-slate-700"
            theme="dark"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{userName}</p>
            <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
              Super Admin
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-150 active:scale-[0.98] cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  )
}

export default SuperAdminSidebar
