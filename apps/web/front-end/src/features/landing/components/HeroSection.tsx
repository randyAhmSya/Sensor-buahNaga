import { Link } from 'react-router-dom'
import { PlayCircle } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'

export function HeroSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-white">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1527842891421-42eec6e703ea?auto=format&fit=crop&w=1920&q=80"
          alt="Suasana Perkebunan Buah Naga AgroLight"
          className="w-full h-full object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Column - Content */}
        <div className="space-y-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
            Otomasi Pencahayaan Kebun Buah Naga Anda
          </h1>

          <p className="text-lg text-slate-600 leading-relaxed">
            Tingkatkan efisiensi listrik hingga 40% dan estimasi panen lebih presisi dengan sistem automasi AgroLight berbasis IoT. Solusi cerdas untuk agribisnis modern.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/login">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-lg font-semibold shadow-md"
              >
                Coba Gratis 14 Hari
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-slate-300 bg-white text-slate-800 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 flex items-center justify-center gap-2"
                leftIcon={<PlayCircle className="w-5 h-5 text-slate-700" />}
              >
                Lihat Demo
              </Button>
            </a>
          </div>
        </div>

        {/* Right Column - Mockup Widget */}
        <div className="relative w-full flex items-center justify-center">
          <Card className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col p-6 space-y-4">
            {/* Window bar */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 text-xs text-slate-400">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block"></span>
              </div>
              <span>dashboard.agrolight.io</span>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 rounded-xl border border-slate-100 bg-slate-50 shadow-none">
                <span className="text-xs text-slate-500">Efisiensi Listrik</span>
                <div className="text-2xl font-bold text-emerald-600 mt-1">+42%</div>
              </Card>
              <Card className="p-4 rounded-xl border border-slate-100 bg-slate-50 shadow-none">
                <span className="text-xs text-slate-500">Status Lampu</span>
                <div className="text-2xl font-bold text-slate-900 mt-1">124 Aktif</div>
                <span className="text-xs text-emerald-600 font-medium">● Zona A - Optimal</span>
              </Card>
            </div>

            {/* Estimation Mockup */}
            <Card className="p-4 rounded-xl border border-slate-100 bg-slate-50 shadow-none flex-1 flex flex-col justify-center items-center border-dashed border-2">
              <span className="text-xs text-slate-400 mb-1">Estimasi Panen</span>
              <div className="text-sm font-semibold text-slate-700">Analisis Siklus Berjalan</div>
            </Card>
          </Card>
        </div>
      </div>
    </section>
  )
}
