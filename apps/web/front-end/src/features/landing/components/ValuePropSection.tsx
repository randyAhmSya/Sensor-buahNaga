import { Cpu, Wifi, SunMedium, ShieldCheck } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { SectionContainer } from '../../../components/common/SectionContainer'
import { ScrollReveal } from './ScrollReveal'

export function ValuePropSection() {
  return (
    <SectionContainer
      id="technology"
      className="py-20 md:py-24 border-y border-slate-200"
      containerClassName="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
    >
      {/* Left Column: Architecture Specification Highlights */}
      <ScrollReveal direction="up" delay={100}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm mb-4">
              <Cpu className="w-7 h-7" strokeWidth={2.25} />
            </div>
            <div className="text-base font-semibold text-slate-900">ESP32 Processing</div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Mikrokontroler 32-bit dengan efisiensi daya tinggi untuk pembacaan telemetri kebun terus-menerus.
            </p>
          </Card>

          <Card className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm mb-4">
              <Wifi className="w-7 h-7" strokeWidth={2.25} />
            </div>
            <div className="text-base font-semibold text-slate-900">Protokol MQTT</div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pengiriman data ringan dan latensi rendah untuk kestabilan koneksi di area kebun.
            </p>
          </Card>

          <Card className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm mb-4">
              <SunMedium className="w-7 h-7" strokeWidth={2.25} />
            </div>
            <div className="text-base font-semibold text-slate-900">Sensor Presisi</div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pemantauan intensitas lux dan suhu lingkungan secara akurat untuk induksi bunga.
            </p>
          </Card>

          <Card className="p-6 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm mb-4">
              <ShieldCheck className="w-7 h-7" strokeWidth={2.25} />
            </div>
            <div className="text-base font-semibold text-slate-900">Offline-Ready</div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Penyimpanan data lokal di memori flash jika jaringan terputus, sinkronisasi otomatis saat online.
            </p>
          </Card>
        </div>
      </ScrollReveal>

      {/* Right Column: Text & Architecture Details */}
      <ScrollReveal direction="up" delay={200}>
        <div className="space-y-6">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            INTEGRASI SISTEM MULTI-PLATFORM
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Kelola Kebun Anda dari Mana Saja
          </h2>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            Sinkronisasi terpadu antara web dashboard untuk analisis mendalam dan aplikasi mobile Android untuk operasional lapangan yang cepat.
          </p>

          <ul className="space-y-4 pt-2">
            <li className="border-l-2 border-emerald-600 pl-4 text-slate-700 text-sm sm:text-base">
              <span className="font-semibold text-slate-900 block">Peringatan Anomali Seketika</span>
              <span className="text-slate-600">Notifikasi instan jika ada gangguan daya atau node sensor offline.</span>
            </li>
            <li className="border-l-2 border-emerald-600 pl-4 text-slate-700 text-sm sm:text-base">
              <span className="font-semibold text-slate-900 block">Kontrol Penyinaran Fleksibel</span>
              <span className="text-slate-600">Konfigurasi jadwal dan intensitas lampu via antarmuka web.</span>
            </li>
            <li className="border-l-2 border-emerald-600 pl-4 text-slate-700 text-sm sm:text-base">
              <span className="font-semibold text-slate-900 block">Rekapitulasi Siap Ekspor</span>
              <span className="text-slate-600">Laporan analitik telemetri dan estimasi panen siap diunduh.</span>
            </li>
          </ul>
        </div>
      </ScrollReveal>
    </SectionContainer>
  )
}
