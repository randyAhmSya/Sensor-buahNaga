import { Outlet } from 'react-router-dom'
import { PublicNavbar } from './PublicNavbar'
import { PublicFooter } from './PublicFooter'

export const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <PublicNavbar />
      {/* flex-1 akan mengambil seluruh sisa tinggi layar dan mendorong banner + footer ke dasar */}
      <main className="flex-1 w-full pt-16 flex flex-col">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
