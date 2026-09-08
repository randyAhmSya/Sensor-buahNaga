import type { FC } from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Sprout, 
  Radio, 
  SunDim, 
  Tractor, 
  QrCode, 
  X 
} from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'

import { getUserProfile } from '@/data/mockUser'

const SIDEBAR_LINKS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Kebun & Blok', path: '/admin/farms', icon: Sprout },
  { label: 'Monitoring Sensor', path: '/admin/sensors', icon: Radio },
  { label: 'Jadwal Lampu', path: '/admin/schedules', icon: SunDim },
  { label: 'Estimasi Panen', path: '/admin/harvests', icon: Tractor },
  { label: 'Kelola QR Code', path: '/admin/qrcodes', icon: QrCode },
]

interface DashboardSidebarProps {
  mobileSidebarOpen: boolean
  onClose: () => void
}

export const DashboardSidebar: FC<DashboardSidebarProps> = ({
  mobileSidebarOpen,
  onClose,
}) => {
  const user = getUserProfile()

  return (
    <aside
      className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-950 text-slate-300 z-50 flex flex-col transition-transform duration-200 ease-in-out border-r border-slate-800
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <BrandLogo variant="light" textSize="text-xl" />
          <span className="text-[11px] font-semibold text-emerald-400 block mt-1 tracking-wider uppercase">
            Farmer Admin
          </span>
        </div>
        <button 
          type="button"
          onClick={onClose} 
          className="md:hidden text-slate-400 hover:text-white cursor-pointer"
          aria-label="Tutup menu sidebar"
        >
          <X className="w-5 h-5" />
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
                flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 active:scale-[0.98]
                ${isActive 
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'}
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-slate-800/80">
        <NavLink
          to="/admin/profile"
          onClick={onClose}
          className={({ isActive }) => `
            flex items-center gap-3 p-2 rounded-xl transition-all duration-150 active:scale-[0.98]
            ${isActive 
              ? 'bg-emerald-800/50 text-white border border-emerald-600' 
              : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'}
          `}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 shrink-0">
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
          </div>
        </NavLink>
      </div>
    </aside>
  )
}
