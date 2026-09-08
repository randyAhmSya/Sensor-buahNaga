import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, LogIn } from 'lucide-react'
import { NAV_LINKS } from '../../constants/landing.constants'
import { BrandLogo } from '../../components/common/BrandLogo'

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getDesktopNavLinkClass = (isActive: boolean) =>
    isActive
      ? 'text-emerald-700 font-bold border-b-2 border-emerald-700 pb-1 transition-colors'
      : 'text-slate-600 font-medium hover:text-emerald-700 pb-1 transition-colors'

  const getMobileNavLinkClass = (isActive: boolean) =>
    isActive
      ? 'text-emerald-700 font-bold border-b-2 border-emerald-700 pb-1 w-fit transition-colors'
      : 'text-slate-600 font-medium hover:text-emerald-700 py-1 transition-colors'

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
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
        <div className="hidden md:flex items-center space-x-4">
          <Link
            to="/login"
            className="text-slate-700 font-semibold hover:text-emerald-700 transition-colors text-sm"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-800 transition-colors text-sm shadow-xs"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
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
              className="flex items-center justify-center gap-2 py-2 text-slate-700 font-semibold hover:text-emerald-700 border border-slate-200 rounded-lg text-sm"
            >
              <LogIn className="w-4 h-4" />
              Log In
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center py-2 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 text-sm shadow-xs"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
