import { Cpu, Radio, Database } from 'lucide-react'
import { SectionContainer } from '../../../components/common/SectionContainer'
import { ScrollReveal } from '../components/ScrollReveal'
import { CtaBanner } from '../components/CtaBanner'
import { LANDING_STYLES } from '../styles'

export function TechnologyPage() {
  const pillars = [
    {
      icon: Cpu,
      title: 'Node Sensor ESP32 Lapangan',
      description:
        'Mikroprosesor 32-bit industri berdaya rendah yang menangani pembacaan sensor intensitas lux, sensor suhu lingkungan, dan aktuator relai lampu secara terus-menerus.',
      badge: 'Hardware Lapangan',
    },
    {
      icon: Radio,
      title: 'Komunikasi Protokol MQTT',
      description:
        'Protokol publish-subscribe berkecepatan tinggi dengan overhead paket data minimal, memastikan transfer data telemetri stabil meski kondisi jaringan seluler kebun terbatas.',
      badge: 'Transmisi Data',
    },
    {
      icon: Database,
      title: 'Sinkronisasi Cloud Offline-Ready',
      description:
        'Penyimpanan telemetri lokal pada memori flash saat koneksi internet terputus, dilengkapi sinkronisasi batch otomatis ke server cloud begitu koneksi kembali aktif.',
      badge: 'Keandalan Data',
    },
  ]

  const specs = [
    {
      label: 'Mikrokontroler Utama',
      value: 'ESP32 Dual-Core Tensilica Xtensa 32-bit LX6',
    },
    {
      label: 'Protokol Komunikasi',
      value: 'MQTT over TLS / WebSockets untuk telemetri real-time',
    },
    {
      label: 'Sensor Cahaya (Lux)',
      value: 'Rentang 1 hingga 65.535 Lux dengan resolusi tinggi',
    },
    {
      label: 'Sensor Suhu Lingkungan',
      value: 'Akurasi tinggi rentang operasional minus 10 hingga 80 derajat Celcius',
    },
    {
      label: 'Ketahanan Daya & Proteksi',
      value: 'Tegangan operasional 5V/12V DC dengan proteksi lonjakan arus',
    },
    {
      label: 'Penyimpanan Offline',
      value: 'Flash memory SPIFFS untuk buffering telemetri tanpa koneksi',
    },
  ]

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-slate-50">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <ScrollReveal direction="up" delay={50}>
            <div className={LANDING_STYLES.eyebrow}>
              ARSITEKTUR &amp; SPESIFIKASI TEKNIS
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={100}>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Teknologi IoT AgroLight
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={150}>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Dibangun dengan arsitektur Internet of Things tangguh yang menghubungkan perangkat keras lapangan, transmisi protokol ringan, dan platform cloud analitik.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* 3 Architecture Pillars */}
      <SectionContainer className="py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <ScrollReveal direction="up" delay={50}>
            <div className={LANDING_STYLES.eyebrow}>
              PILAR INFRASTRUKTUR
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={100}>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Fondasi Perangkat Keras dan Jaringan
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={150}>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Tiga komponen inti yang menjamin kelangsungan operasional dan kestabilan data kebun buah naga Anda.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <ScrollReveal key={pillar.title} direction="up" delay={150 + idx * 75}>
                <div className="h-full bg-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`${LANDING_STYLES.iconContainer} mb-2`}>
                        <Icon className={LANDING_STYLES.icon} strokeWidth={2.25} />
                      </div>
                      <span className={LANDING_STYLES.badge}>
                        {pillar.badge}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </SectionContainer>

      {/* Technical Specifications Table / Grid */}
      <section className="bg-white border-y border-slate-200 py-16 md:py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <ScrollReveal direction="up" delay={50}>
              <div className={LANDING_STYLES.eyebrow}>
                PARAMETER OPERASIONAL
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={100}>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Spesifikasi Teknis Perangkat
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150}>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Rincian standar teknis perangkat keras dan antarmuka jaringan yang diimplementasikan di kebun.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specs.map((spec, idx) => (
              <ScrollReveal key={spec.label} direction="up" delay={100 + idx * 50}>
                <div className="p-6 rounded-2xl bg-slate-50 space-y-2">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {spec.label}
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                    {spec.value}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <CtaBanner />
    </div>
  )
}
export default TechnologyPage
