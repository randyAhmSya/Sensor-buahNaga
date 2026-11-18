import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import logoImg from '@/assets/logo.png'
import { ScrollReveal } from './ScrollReveal'
import { LANDING_BUTTONS } from '../styles'

export function HeroSection() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <section className="relative mx-4 md:mx-8 my-4 rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl text-white min-h-[640px] flex flex-col justify-between p-6 sm:p-10 md:p-12">
      {/* Real Farm Photography Background */}
      <img
        src="/hero.png"
        alt="Perkebunan Buah Naga AgroLight"
        className="absolute inset-0 h-full w-full object-cover object-center z-0"
      />

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-900 via-slate-900 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900 via-transparent to-transparent sm:hidden pointer-events-none" />

      {/* Integrated Dark Navbar inside Hero Container */}
      <header className="w-full flex items-center justify-between pb-6 md:pb-8 border-b border-slate-800 relative z-30">
        {/* Brand Logo */}
        <Link to="/" className="inline-flex items-center gap-3 select-none">
          <img
            src={logoImg}
            alt="AgroLight Logo"
            className="w-8 h-8 object-contain shrink-0"
          />
          <span className="font-extrabold text-2xl tracking-tight leading-none">
            <span className="text-white">Agro</span>
            <span className="text-brand-400">Light</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link
            to="/fitur"
            className="text-slate-300 hover:text-brand-400 transition-colors py-1"
          >
            Fitur
          </Link>
          <Link
            to="/teknologi"
            className="text-slate-300 hover:text-brand-400 transition-colors py-1"
          >
            Teknologi
          </Link>
          <Link
            to="/cara-kerja"
            className="text-slate-300 hover:text-brand-400 transition-colors py-1"
          >
            Cara Kerja
          </Link>
          <Link
            to="/unduh-aplikasi"
            className="text-slate-300 hover:text-brand-400 transition-colors py-1"
          >
            Unduh Aplikasi
          </Link>
        </nav>

        {/* Right Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-3.5">
          <Link
            to="/login"
            className={`${LANDING_BUTTONS.secondaryDark} px-5 py-2.5 text-xs sm:text-sm`}
          >
            Masuk Dashboard
          </Link>
          <Link
            to="/unduh-aplikasi"
            className={`${LANDING_BUTTONS.primaryDark} px-5 py-2.5 text-xs sm:text-sm`}
          >
            <span>Unduh Aplikasi</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-hidden"
            aria-label="Buka menu navigasi"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu Inside Hero */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-3 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col space-y-4 animate-in fade-in slide-in-from-top-2 z-50">
            <Link
              to="/fitur"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-brand-400 font-medium text-sm py-1"
            >
              Fitur
            </Link>
            <Link
              to="/teknologi"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-brand-400 font-medium text-sm py-1"
            >
              Teknologi
            </Link>
            <Link
              to="/cara-kerja"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-brand-400 font-medium text-sm py-1"
            >
              Cara Kerja
            </Link>
            <Link
              to="/unduh-aplikasi"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-200 hover:text-brand-400 font-medium text-sm py-1"
            >
              Unduh Aplikasi
            </Link>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2.5">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`${LANDING_BUTTONS.secondaryDark} w-full text-center py-2.5 text-sm`}
              >
                Masuk Dashboard
              </Link>
              <Link
                to="/unduh-aplikasi"
                onClick={() => setMobileMenuOpen(false)}
                className={`${LANDING_BUTTONS.primaryDark} w-full text-center py-2.5 text-sm`}
              >
                <span>Unduh Aplikasi</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Hero Content */}
      <div className="w-full py-8 md:py-14 relative z-20">
        <ScrollReveal direction="up" delay={150}>
          <div className="max-w-2xl space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-brand-400">
              SOLUSI IOT &amp; SMART FARMING BUAH NAGA
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-white tracking-tight leading-[1.15]">
              Otomasi Pencahayaan &amp; Monitoring Kebun Buah Naga
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Tingkatkan efisiensi listrik dan estimasi panen lebih presisi dengan sistem automasi AgroLight berbasis IoT. Solusi cerdas untuk agribisnis buah naga modern.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <Link
                to="/login"
                className={`${LANDING_BUTTONS.primaryDark} px-6 py-3.5 gap-2 text-sm sm:text-base select-none`}
              >
                <span>Masuk ke Dashboard</span>
                <ArrowUpRight className="w-5 h-5 text-brand-950" strokeWidth={2.25} />
              </Link>

              <Link
                to="/unduh-aplikasi"
                className={`${LANDING_BUTTONS.secondaryDark} px-6 py-3.5 text-sm sm:text-base select-none`}
              >
                <span>Unduh Aplikasi</span>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
