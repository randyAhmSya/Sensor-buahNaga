import { NavLink } from 'react-router-dom'
import { Activity, Sprout, QrCode, LogOut, ShieldCheck, Sun } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { cn } from '../../utils/cn'

export function AdminSidebar() {
  const { user, logout } = useAuthStore()

  const navItems = [
    {
      label: 'Kesehatan Sensor & Gateway',
      to: '/admin/monitoring',
      icon: <Activity className="h-5 w-5" />,
    },
    {
      label: 'Estimasi Panen & Lux',
      to: '/admin/estimasi',
      icon: <Sprout className="h-5 w-5" />,
    },
    {
      label: 'Generator & Stiker QR',
      to: '/admin/qr',
      icon: <QrCode className="h-5 w-5" />,
    },
  ]

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-black shadow-md shadow-emerald-600/30">
            A
          </div>
          <div>
            <span className="text-base font-black text-white tracking-tight flex items-center gap-1">
              Agro<span className="text-emerald-400">Light</span>
            </span>
            <span className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider block -mt-1">
              Portal Admin Kebun
            </span>
          </div>
        </div>

        {/* Plantation Status pill */}
        <div className="m-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Sun className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">Kebun Naga Banyuwangi</p>
            <p className="text-[11px] text-slate-400 truncate">5 Blok Aktif &bull; Enterprise</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="px-3 space-y-1 mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                )
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Section Bottom */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1 truncate">
              <ShieldCheck className="h-3 w-3" />
              {user?.role || 'ADMIN_KEBUN'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  )
}
