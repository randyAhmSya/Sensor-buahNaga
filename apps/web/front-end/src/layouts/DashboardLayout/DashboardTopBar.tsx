import { useState, useRef, useEffect, type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Settings, Menu, LogOut, ChevronDown, User } from 'lucide-react'
import { useAuthStore, getRoleLabel } from '@/store/useAuthStore'
import { USER_ROLES } from '@/config/constants'
import { authService } from '@/services/authService'
import { NotificationPopover } from '@/components/common/NotificationPopover'
import { UserAvatar } from '@/components/common/UserAvatar'

interface DashboardTopBarProps {
  onOpenMobileSidebar: () => void
}

export const DashboardTopBar: FC<DashboardTopBarProps> = ({ onOpenMobileSidebar }) => {
  const navigate = useNavigate()
  const { user: authUser, logout } = useAuthStore()

  const isSuperAdmin = authUser?.role === USER_ROLES.SUPER_ADMIN
  const activeFarmName = isSuperAdmin ? 'Sistem Terpusat (Super Admin)' : 'AgroLight Smart Farm'

  const userName = authUser?.name || 'Budi Santoso'
  const userEmail = authUser?.email || 'budi@agrolight.id'
  const userRoleLabel = getRoleLabel(authUser?.role)
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
    <header className="h-16 bg-white border-b border-slate-200 px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button 
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden w-11 h-11 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer active:scale-95 shrink-0"
          aria-label="Buka menu sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-emerald-800 bg-white border border-emerald-600 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold shadow-2xs min-w-0 max-w-[150px] xs:max-w-[200px] sm:max-w-xs md:max-w-md">
          <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-700 shrink-0" />
          <span className="truncate">{activeFarmName}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
        <NotificationPopover role="admin_kebun" />
        <Link 
          to={isSuperAdmin ? "/admin/profile" : "/kebun/profile"}
          className="p-2 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors cursor-pointer active:scale-95"
          aria-label="Pengaturan"
          title="Pengaturan"
        >
          <Settings className="w-4 h-4 text-slate-500 shrink-0" strokeWidth={1.75} />
        </Link>

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 sm:p-2 min-h-[44px] rounded-full hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
            aria-label="Menu profil pengguna"
            aria-expanded={isDropdownOpen}
          >
            <UserAvatar
              src={userAvatar}
              name={userName}
              className="w-8 h-8 border-slate-200 shadow-2xs shrink-0"
              theme="light"
            />
            <span className="hidden sm:inline-block text-xs font-bold text-slate-800 pr-0.5 truncate max-w-[120px]">
              {userName}
            </span>
            <ChevronDown strokeWidth={1.75} className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header Info */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900 truncate">{userName}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>
                <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                  isSuperAdmin 
                    ? 'bg-slate-100 text-slate-700 border-slate-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {userRoleLabel}
                </span>
              </div>

              {/* Menu Links */}
              <div className="py-1">
                <Link
                  to={isSuperAdmin ? "/admin/profile" : "/kebun/profile"}
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
                  <span>Pengaturan Profil</span>
                </Link>
                <Link
                  to={isSuperAdmin ? "/admin/dashboard" : "/kebun/dashboard"}
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
                  <span>{isSuperAdmin ? 'Dasbor Super Admin' : 'Dasbor Utama'}</span>
                </Link>
              </div>

              {/* Divider & Logout Button */}
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
