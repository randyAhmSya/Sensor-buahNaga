import { NavLink, Link, useNavigate } from 'react-router-dom'
import { CalendarCheck, QrCode, LogOut, SunMedium, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { authService } from '../../services/authService'
import { cn } from '../../utils/cn'
import logoAgroLight from '@/assets/logo.png'
import { UserAvatar } from '@/components/common/UserAvatar'

export function PetaniSidebar() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const navItems = [
    {
      label: 'Estimasi & Jadwal Panen',
      to: '/petani/estimasi',
      icon: <CalendarCheck className="w-4 h-4 shrink-0" strokeWidth={1.75} />,
    },
    {
      label: 'Pindai & Cetak QR Lapangan',
      to: '/petani/qr',
      icon: <QrCode className="w-4 h-4 shrink-0" strokeWidth={1.75} />,
    },
    {
      label: 'Izin Akses Tenant',
      to: '/petani/akses-tenant',
      icon: <ShieldCheck className="w-4 h-4 shrink-0" strokeWidth={1.75} />,
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
    <aside className="w-64 bg-emerald-950 text-slate-200 flex flex-col justify-between shrink-0 border-r border-emerald-900 min-h-[100dvh] sticky top-0">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-emerald-900 bg-emerald-950">
          <Link to="/petani/estimasi" className="flex items-center gap-3 select-none">
            <img src={logoAgroLight} alt="AgroLight Logo" className="w-8 h-8 object-contain shrink-0" />
            <div>
              <span className="text-base font-black text-white tracking-tight flex items-center gap-1">
                Agro<span className="text-emerald-400">Light</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mt-0.5">
                Portal Petani
              </span>
            </div>
          </Link>
        </div>

        <div className="m-4 p-3 rounded-xl bg-emerald-900/60 border border-emerald-800 text-xs flex items-center gap-2">
          <SunMedium className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={1.75} />
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
          <UserAvatar
            src={user?.avatarUrl}
            name={user?.name || 'Petani Kebun'}
            className="w-8 h-8 bg-emerald-800 text-white border-emerald-700 shrink-0"
            textClassName="text-xs font-bold text-white"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Petani Kebun'}</p>
            <p className="text-[10px] text-emerald-400">Petani Pelaksana</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-800 transition-all duration-150 active:scale-[0.98] cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  )
}
