import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { NAV_LINKS } from '../../constants/landing.constants'
import { BrandLogo } from '../../components/common/BrandLogo'
import { LANDING_BUTTONS } from '../../features/landing/styles'

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getDesktopNavLinkClass = (isActive: boolean) =>
    isActive
      ? 'text-brand-700 font-bold border-b-2 border-brand-700 pb-1 transition-colors'
      : 'text-slate-600 font-medium hover:text-brand-700 pb-1 transition-colors'

  const getMobileNavLinkClass = (isActive: boolean) =>
    isActive
      ? 'text-brand-700 font-bold border-b-2 border-brand-700 pb-1 w-fit transition-colors'
      : 'text-slate-600 font-medium hover:text-brand-700 py-1 transition-colors'

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white shadow-xs transition-all">
      <div className="flex justify-between items-center p-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <BrandLogo variant="dark" />

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) => getDesktopNavLinkClass(isActive)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <Link
            to="/login"
            className={`${LANDING_BUTTONS.secondaryLight} text-sm px-4 py-2 select-none`}
          >
            Masuk Dashboard
          </Link>
          <Link
            to="/unduh-aplikasi"
            className={`${LANDING_BUTTONS.primaryLight} text-sm px-4 py-2 select-none`}
          >
            <span>Unduh Aplikasi</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-6 py-4 space-y-3 shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col space-y-3 text-slate-600 font-medium">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => getMobileNavLinkClass(isActive)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className={`${LANDING_BUTTONS.secondaryLight} w-full py-2.5 text-sm select-none`}
            >
              Masuk Dashboard
            </Link>
            <Link
              to="/unduh-aplikasi"
              onClick={() => setMobileMenuOpen(false)}
              className={`${LANDING_BUTTONS.primaryLight} w-full py-2.5 text-sm select-none`}
            >
              <span>Unduh Aplikasi</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
