import { Link } from 'react-router-dom'
import { NAV_LINKS } from '../../constants/landing.constants'
import logoImg from '@/assets/logo.png'

export function PublicFooter() {
  return (
    <footer
      id="about-us"
      className="rounded-t-3xl bg-slate-900 text-slate-300 border-t border-slate-800 overflow-hidden relative mt-auto"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-3 select-none">
              <img
                src={logoImg}
                alt="AgroLight Logo"
                className="w-8 h-8 object-contain shrink-0"
              />
              <span className="font-extrabold text-2xl tracking-tight leading-none">
                <span className="text-white">Agro</span>
                <span className="text-emerald-400">Light</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Solusi otomasi pencahayaan berbasis IoT dan estimasi panen presisi untuk perkebunan buah naga modern.
            </p>
            <div className="pt-1">
              <Link
                to="/unduh-aplikasi"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all select-none"
              >
                <span>Unduh Aplikasi</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Navigasi</h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="hover:text-emerald-400 transition-colors">
                    {link.footerLabel || link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/login" className="hover:text-emerald-400 transition-colors">
                  Masuk Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Solution Links */}
          <div>
            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Solusi IoT</h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link to="/fitur" className="hover:text-emerald-400 transition-colors">
                  Auto-Dimming Lampu Cerdas
                </Link>
              </li>
              <li>
                <Link to="/teknologi" className="hover:text-emerald-400 transition-colors">
                  Sensor Telemetri &amp; Suhu
                </Link>
              </li>
              <li>
                <Link to="/fitur" className="hover:text-emerald-400 transition-colors">
                  Estimasi Panen Presisi
                </Link>
              </li>
              <li>
                <Link to="/cara-kerja" className="hover:text-emerald-400 transition-colors">
                  Monitoring Zona QR Code
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Kontak Kami</h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>info@agrolight.io</li>
              <li>+62 812-3456-7890</li>
              <li>Banyuwangi, Jawa Timur, Indonesia</li>
            </ul>
          </div>
        </div>

        {/* Solid Typography Watermark without opacity modifier */}
        <div className="pt-8 pb-4 flex justify-between items-end overflow-hidden select-none">
          <div className="font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tighter text-slate-800 leading-none">
            AgroLight
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>&copy; {new Date().getFullYear()} AgroLight. Hak Cipta Dilindungi.</p>
          <div className="flex space-x-6">
            <span className="hover:text-slate-200 cursor-pointer transition-colors">Kebijakan Privasi</span>
            <span className="hover:text-slate-200 cursor-pointer transition-colors">Syarat &amp; Ketentuan</span>
            <span className="hover:text-slate-200 cursor-pointer transition-colors">Bantuan</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
