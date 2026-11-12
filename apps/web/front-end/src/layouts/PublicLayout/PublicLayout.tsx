import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PublicNavbar } from './PublicNavbar'
import { PublicFooter } from './PublicFooter'

export const PublicLayout = () => {
  const location = useLocation()
  const isLandingPage = location.pathname === '/'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      {!isLandingPage && <PublicNavbar />}
      {/* Pada halaman utama (/), Hero container menyematkan navbar gelap terintegrasi */}
      <main className={`flex-1 w-full flex flex-col ${isLandingPage ? '' : 'pt-16'}`}>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}
