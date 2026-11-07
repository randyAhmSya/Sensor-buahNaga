import { useState, useEffect, type FC } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DashboardSidebar } from './DashboardSidebar'
import { DashboardTopBar } from './DashboardTopBar'
import { SubscriptionLockedBanner } from '@/components/common/SubscriptionLockedBanner'
import { petaniSubscriptionService } from '@/services/petaniSubscriptionService'
import { petaniSubscriptionKeys } from '@/services/queryKeys'
import { useAuthStore } from '@/store/useAuthStore'
import { USER_ROLES } from '@/config/constants'
import { useSaasMode } from '@/context/SaasContext'

export const DashboardLayout: FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuthStore()
  const { isSaasEnabled } = useSaasMode()

  const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN
  const isExcludedPath = location.pathname.includes('/kebun/langganan') || location.pathname.includes('/kebun/akses-tenant')

  // Check subscription status for non-superadmin (hanya jika mode SaaS aktif)
  const { data: subscriptionStatus } = useQuery({
    queryKey: petaniSubscriptionKeys.status(),
    queryFn: () => petaniSubscriptionService.getStatus(),
    enabled: !isSuperAdmin && !!user && isSaasEnabled,
    staleTime: 60 * 1000,
  })

  const isExpired = isSaasEnabled && subscriptionStatus?.status_langganan === 'kadaluarsa'

  // Tutup drawer saat menekan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileSidebarOpen(false)
      }
    }
    if (mobileSidebarOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [mobileSidebarOpen])

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex font-sans text-slate-900">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Kiri */}
      <DashboardSidebar 
        mobileSidebarOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <DashboardTopBar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

        {/* Content Canvas */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto">
          {isExpired && !isExcludedPath && (
            <SubscriptionLockedBanner className="mb-6" />
          )}
          <Outlet />
        </main>
      </div>
    </div>
  )
}

