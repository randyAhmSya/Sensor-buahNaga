import { useState, type FC } from 'react'
import { Outlet } from 'react-router-dom'
import { SuperAdminSidebar } from './SuperAdminSidebar'
import { SuperAdminTopBar } from './SuperAdminTopBar'

export const SuperAdminLayout: FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Super Admin */}
      <SuperAdminSidebar 
        mobileSidebarOpen={mobileSidebarOpen} 
        onClose={() => setMobileSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <SuperAdminTopBar onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default SuperAdminLayout
