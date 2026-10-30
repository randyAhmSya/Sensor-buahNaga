import { Outlet } from 'react-router-dom'
import { PetaniSidebar } from './PetaniSidebar'
import { NotificationPopover } from '@/components/common/NotificationPopover'
import { useFarmsQuery } from '@/hooks/queries/useFarmsQuery'

export function PetaniLayout() {
  const { data: farms = [] } = useFarmsQuery()
  const activeFarmName = farms[0]?.name || 'AgroLight'

  return (
    <div className="min-h-[100dvh] flex bg-slate-50 text-slate-900">
      <PetaniSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="text-xs text-slate-600 font-medium truncate max-w-xs">
            {activeFarmName} &bull; Panel Petani Lapangan
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold">
              Status Kebun: Kondusif
            </div>
            <NotificationPopover role="petani" />
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
