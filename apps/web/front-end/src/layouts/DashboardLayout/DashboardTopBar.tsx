import { useState, useRef, useEffect, type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Bell, Settings, Menu, LogOut, ChevronDown, User } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { authService } from '@/services/authService'

interface DashboardTopBarProps {
  onOpenMobileSidebar: () => void
}

export const DashboardTopBar: FC<DashboardTopBarProps> = ({ onOpenMobileSidebar }) => {
  const navigate = useNavigate()
  const { user: authUser, logout } = useAuthStore()
  const activeFarmName = 'AgroLight Smart Farm'

  const userName = authUser?.name || 'Budi Santoso'
  const userEmail = authUser?.email || 'budi@agrolight.id'
  const userRole = authUser?.role || 'Farmer Admin'
  const userAvatar = authUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'

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
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-4">
        <button 
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Buka menu sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-emerald-800 bg-white border border-emerald-600 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-2xs">
          <MapPin className="w-4 h-4 text-emerald-700" />
          <span>{activeFarmName}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          type="button"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer"
          aria-label="Notifikasi"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
        </button>
        <Link 
          to="/admin/profile"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Pengaturan"
        >
          <Settings className="w-5 h-5" />
        </Link>

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Menu profil pengguna"
            aria-expanded={isDropdownOpen}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-2xs">
              <img
                src={userAvatar}
                alt={userName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="hidden sm:inline-block text-xs font-bold text-slate-800 pr-0.5">
              {userName}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header Info */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>
                <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {userRole}
                </span>
              </div>

              {/* Menu Links */}
              <div className="py-1">
                <Link
                  to="/admin/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Pengaturan Profil</span>
                </Link>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Dasbor Utama</span>
                </Link>
              </div>

              {/* Divider & Logout Button */}
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
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
