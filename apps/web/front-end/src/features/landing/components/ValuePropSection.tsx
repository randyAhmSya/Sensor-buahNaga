import { CheckCircle2, Smartphone, Wifi, BatteryCharging, AlertTriangle } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { SectionContainer } from '../../../components/common/SectionContainer'

export function ValuePropSection() {
  return (
    <SectionContainer
      bg="slate-50"
      className="py-24 border-y border-slate-200"
      containerClassName="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
    >
      {/* Left Column - Field Monitoring Mockup Card */}
      <Card className="w-full min-h-[380px] bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-sm">
        {/* Top mobile preview bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-700 text-white">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">AgroLight Mobile Lapangan</div>
              <div className="text-[10px] text-slate-500">Blok Kebun Buah Naga - Zona 04</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold">
            <Wifi className="w-3.5 h-3.5" />
            <span>LoRa Online</span>
          </div>
        </div>

        {/* Field Status Cards */}
        <div className="space-y-3 my-4">
          <Card className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
              <div>
                <div className="text-xs text-slate-500">Lampu Induksi Bunga</div>
                <div className="text-sm font-bold text-slate-800">Menyala (Jadwal Otomatis: 18:00 - 22:00)</div>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              Aktif
            </span>
          </Card>

          <Card className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BatteryCharging className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-xs text-slate-500">Daya Baterai Node Sensor</div>
                <div className="text-sm font-bold text-slate-800">94% (Solar Panel Optimal)</div>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-500">Tegangan Stabil</span>
          </Card>

          <Card className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs flex items-center gap-2.5 text-slate-600 shadow-none">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Sensor mendeteksi intensitas mendung, durasi penyinaran disesuaikan otomatis.</span>
          </Card>
        </div>

        {/* Bottom Caption */}
        <div className="text-center text-xs font-medium text-slate-500">
          Sinkronisasi Cloud Real-time &bull; Latensi &lt; 2 Detik
        </div>
      </Card>

      {/* Right Column - Text & Checklist */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
          Kelola kebun Anda dari mana saja
        </h2>
        <p className="text-slate-600 leading-relaxed text-base sm:text-lg">
          Sinkronisasi sempurna antara web dashboard untuk analisis mendalam dan aplikasi mobile untuk pemantauan lapangan yang cepat.
        </p>

        <ul className="space-y-3.5 pt-1">
          <li className="flex items-center gap-3 text-slate-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Notifikasi real-time jika ada anomali daya.</span>
          </li>
          <li className="flex items-center gap-3 text-slate-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Kontrol manual lampu via aplikasi.</span>
          </li>
          <li className="flex items-center gap-3 text-slate-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Laporan ekspor otomatis ke format PDF/CSV.</span>
          </li>
        </ul>
      </div>
    </SectionContainer>
  )
}
