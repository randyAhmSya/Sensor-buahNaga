import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Bell, Settings, Menu } from 'lucide-react'
import { getAllFarms } from '@/data/mockFarms'
import { getUserProfile } from '@/data/mockUser'

interface DashboardTopBarProps {
  onOpenMobileSidebar: () => void
}

export const DashboardTopBar: FC<DashboardTopBarProps> = ({ onOpenMobileSidebar }) => {
  const activeFarmName = getAllFarms()[0]?.name || 'Kebun Buah Naga'
  const user = getUserProfile()

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
        <Link
          to="/admin/profile"
          className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 transition-colors"
          title={`Profil: ${user.fullName}`}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-2xs">
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="hidden sm:inline-block text-xs font-bold text-slate-800 pr-1">
            {user.fullName}
          </span>
        </Link>
      </div>
    </header>
  )
}
