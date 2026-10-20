import type { FC } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Trees, 
  Cpu, 
  Clock, 
  CalendarCheck, 
  QrCode, 
  CreditCard,
  ShieldCheck,
  X,
  LogOut
} from 'lucide-react'
import logoImg from '@/assets/logo.png'
import { useAuthStore, getRoleLabel } from '@/store/useAuthStore'
import { USER_ROLES } from '@/config/constants'
import { authService } from '@/services/authService'
import { UserAvatar } from '@/components/common/UserAvatar'

const SIDEBAR_LINKS = [
  { label: 'Dashboard', path: '/kebun/dashboard', icon: LayoutDashboard },
  { label: 'Kebun & Blok', path: '/kebun/farms', icon: Trees },
  { label: 'Monitoring Sensor', path: '/kebun/sensors', icon: Cpu },
  { label: 'Jadwal Lampu', path: '/kebun/schedules', icon: Clock },
  { label: 'Estimasi Panen', path: '/kebun/harvests', icon: CalendarCheck },
  { label: 'Kelola QR Code', path: '/kebun/qrcodes', icon: QrCode },
  { label: 'Langganan', path: '/kebun/langganan', icon: CreditCard },
  { label: 'Akses Super Admin', path: '/kebun/akses-tenant', icon: ShieldCheck },
]

interface DashboardSidebarProps {
  mobileSidebarOpen: boolean
  onClose: () => void
}

export const DashboardSidebar: FC<DashboardSidebarProps> = ({
  mobileSidebarOpen,
  onClose,
}) => {
  const navigate = useNavigate()
  const { user: authUser, logout } = useAuthStore()

  const isSuperAdmin = authUser?.role === USER_ROLES.SUPER_ADMIN
  const userName = authUser?.name || 'Budi Santoso'
  const userRoleLabel = getRoleLabel(authUser?.role)
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
        fixed lg:sticky top-0 left-0 h-[100dvh] w-64 bg-slate-950 text-slate-300 z-50 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <Link to={isSuperAdmin ? "/admin/dashboard" : "/kebun/dashboard"} className="flex items-center gap-3 select-none">
          <img src={logoImg} alt="AgroLight Logo" className="w-8 h-8 object-contain shrink-0" />
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight leading-none block">
              Agro<span className="text-emerald-400">Light</span>
            </span>
            <span className="text-[10px] font-medium text-slate-400 block mt-0.5 tracking-wider uppercase">
              {isSuperAdmin ? 'Super Admin' : 'Portal Petani'}
            </span>
          </div>
        </Link>
        <button 
          type="button"
          onClick={onClose} 
          className="lg:hidden w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition-colors cursor-pointer active:scale-95"
          aria-label="Tutup menu sidebar"
        >
          <X className="w-5 h-5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Sidebar Nav */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {SIDEBAR_LINKS.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3.5 py-3 min-h-[44px] rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.98]
                ${isActive 
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'}
              `}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* User Profile & Logout Footer */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        <NavLink
          to={isSuperAdmin ? "/admin/profile" : "/kebun/profile"}
          onClick={onClose}
          className={({ isActive }) => `
            flex items-center gap-3 p-2.5 min-h-[44px] rounded-xl transition-all duration-150 active:scale-[0.98]
            ${isActive 
              ? 'bg-emerald-800/50 text-white border border-emerald-600' 
              : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'}
          `}
        >
          <UserAvatar
            src={userAvatar}
            name={userName}
            className="w-8 h-8 border-slate-700 shrink-0"
            theme="dark"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{userName}</p>
            <p className="text-[10px] text-slate-400 truncate">{userRoleLabel}</p>
          </div>
        </NavLink>

        {/* Tombol Logout Sidebar */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800 transition-all duration-150 active:scale-[0.98] cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Keluar Akun</span>
        </button>
      </div>
    </aside>
  )
}
