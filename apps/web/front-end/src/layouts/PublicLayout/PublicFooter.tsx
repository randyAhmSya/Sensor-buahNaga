import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import { NAV_LINKS } from '../../constants/landing.constants'
import { BrandLogo } from '../../components/common/BrandLogo'

export function PublicFooter() {
  return (
    <footer id="about-us" className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <BrandLogo variant="light" />
            <p className="text-sm text-slate-400 leading-relaxed">
              Solusi otomasi pencahayaan berbasis IoT dan estimasi panen presisi untuk perkebunan buah naga modern.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Navigasi</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
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
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Auto-Dimming Lampu</li>
              <li>Sensor Kelembaban & Suhu</li>
              <li>Estimasi Panen AI</li>
              <li>Monitoring Zona QR Code</li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-4">Kontak Kami</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>info@agrolight.io</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Banyuwangi, Jawa Timur, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>&copy; {new Date().getFullYear()} AgroLight. Hak Cipta Dilindungi.</p>
          <div className="flex space-x-6">
            <span className="hover:text-slate-400 cursor-pointer">Kebijakan Privasi</span>
            <span className="hover:text-slate-400 cursor-pointer">Syarat &amp; Ketentuan</span>
            <span className="hover:text-slate-400 cursor-pointer">Bantuan</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
