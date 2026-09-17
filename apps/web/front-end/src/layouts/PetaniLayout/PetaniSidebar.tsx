import { NavLink, useNavigate } from 'react-router-dom'
import { Sprout, QrCode, LogOut, Sun } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { authService } from '../../services/authService'
import { cn } from '../../utils/cn'

export function PetaniSidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const navItems = [
    {
      label: 'Estimasi & Jadwal Panen',
      to: '/petani/estimasi',
      icon: <Sprout className="h-5 w-5" />,
    },
    {
      label: 'Pindai & Cetak QR Lapangan',
      to: '/petani/qr',
      icon: <QrCode className="h-5 w-5" />,
    },
  ]

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
    <aside className="w-64 bg-emerald-950 text-slate-200 flex flex-col justify-between shrink-0 border-r border-emerald-900 h-screen sticky top-0">
      <div>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-emerald-900 bg-emerald-950">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-md">
            P
          </div>
          <div>
            <span className="text-base font-black text-white tracking-tight flex items-center gap-1">
              Agro<span className="text-emerald-400">Light</span>
            </span>
            <span className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider block -mt-1">
              Mode Petani Lapangan
            </span>
          </div>
        </div>

        <div className="m-4 p-3 rounded-xl bg-emerald-900/60 border border-emerald-800 text-xs flex items-center gap-2">
          <Sun className="h-4 w-4 text-amber-400 shrink-0" />
          <span>Lampu Malam Aktif Sesuai Jadwal Otomatis</span>
        </div>

        <nav className="px-3 space-y-1 mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-900/60'
                )
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-emerald-900 bg-emerald-950">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-emerald-800 flex items-center justify-center text-white font-bold text-xs">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Petani Kebun'}</p>
            <p className="text-[10px] text-emerald-400">Petani Pelaksana</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-300 hover:text-white hover:bg-emerald-900/80 border border-emerald-800 transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  )
}
