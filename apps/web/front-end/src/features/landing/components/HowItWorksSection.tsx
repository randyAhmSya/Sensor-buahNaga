import { Link } from 'react-router-dom'
import { QrCode, Sun, BarChart3, ArrowUpRight } from 'lucide-react'
import { SectionContainer } from '../../../components/common/SectionContainer'
import { ScrollReveal } from './ScrollReveal'

const workflowSteps = [
  {
    stepNumber: 'LANGKAH 01',
    icon: QrCode,
    title: 'Pemasangan & Pemindaian QR',
    description:
      'Petani memasang node sensor dan gateway di blok kebun buah naga, lalu memindai kode QR fisik untuk mendaftarkan node ke dashboard secara instan.',
    outputLabel: 'Output: Node terdaftar & terhubung ke broker MQTT',
  },
  {
    stepNumber: 'LANGKAH 02',
    icon: Sun,
    title: 'Otomasi Penyinaran & Auto-Dimming',
    description:
      'Sistem mengontrol lampu LED tambahan pada malam hari secara otomatis menyesuaikan nilai lux target untuk merangsang pembungaan di luar musim.',
    outputLabel: 'Output: Penyesuaian daya lampu sesuai kebutuhan lux',
  },
  {
    stepNumber: 'LANGKAH 03',
    icon: BarChart3,
    title: 'Telemetri & Estimasi Panen',
    description:
      'Data intensitas lux, suhu udara, dan durasi penyinaran terakumulasi otomatis ke grafik analitik untuk membantu petani memprediksi jadwal panen.',
    outputLabel: 'Output: Laporan siap unduh dan estimasi panen presisi',
  },
]

export function HowItWorksSection() {
  return (
    <SectionContainer className="py-20 md:py-24" id="how-it-works">
      <ScrollReveal direction="up" delay={50}>
        <div className="text-center mb-16 max-w-2xl mx-auto space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            ALUR OPERASIONAL TERSTRUKTUR
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Cara Kerja AgroLight
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Tiga langkah terpadu menuju efisiensi pencahayaan kebun buah naga tanpa konfigurasi rumit.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {workflowSteps.map((step, idx) => {
          const IconComponent = step.icon

          return (
            <ScrollReveal
              key={step.stepNumber}
              direction="up"
              delay={100 + idx * 150}
              className="h-full"
            >
              <div className="group relative h-full rounded-2xl bg-white border border-slate-200 p-7 shadow-sm hover:border-emerald-600 transition-colors duration-300 flex flex-col justify-between text-left">
                {/* Header: Step Number & Focal Icon */}
                <div>
                  <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                    <span className="text-2xl font-bold text-emerald-700 font-mono tracking-tight">
                      {step.stepNumber}
                    </span>
                    <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                      <IconComponent className="w-7 h-7" strokeWidth={2.25} />
                    </div>
                  </div>

                  {/* Middle: Title & Description */}
                  <div className="pt-5 space-y-2.5">
                    <h3 className="font-semibold text-base sm:text-lg text-slate-900 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Footer: Concrete Output Indicator (Minimalist typography without decorative icons) */}
                <div className="pt-6 mt-6 border-t border-slate-100 text-xs font-semibold text-emerald-800">
                  <span>{step.outputLabel}</span>
                </div>
              </div>
            </ScrollReveal>
          )
        })}
      </div>

      {/* Action to Full Implementation Flow Page */}
      <div className="mt-12 text-center">
        <ScrollReveal direction="up" delay={200}>
          <Link
            to="/cara-kerja"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all shadow-sm select-none"
          >
            <span>Pelajari Alur Lengkap</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" strokeWidth={2.25} />
          </Link>
        </ScrollReveal>
      </div>
    </SectionContainer>
  )
}


