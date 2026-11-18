import { Link } from 'react-router-dom'
import { QrCode, Sun, BarChart3, ArrowUpRight } from 'lucide-react'
import { SectionContainer } from '../../../components/common/SectionContainer'
import { ScrollReveal } from './ScrollReveal'
import { LANDING_BUTTONS, LANDING_STYLES } from '../styles'

const workflowSteps = [
  {
    stepNumber: '01',
    icon: QrCode,
    title: 'Pemasangan & Pemindaian QR',
    description:
      'Petani memasang node sensor dan gateway di blok kebun buah naga, lalu memindai kode QR fisik untuk mendaftarkan node ke dashboard secara instan.',
    outputLabel: 'Node terdaftar & terhubung ke broker MQTT',
  },
  {
    stepNumber: '02',
    icon: Sun,
    title: 'Otomasi Penyinaran & Auto-Dimming',
    description:
      'Sistem mengontrol lampu LED tambahan pada malam hari secara otomatis menyesuaikan nilai lux target untuk merangsang pembungaan di luar musim.',
    outputLabel: 'Penyesuaian daya lampu sesuai kebutuhan lux',
  },
  {
    stepNumber: '03',
    icon: BarChart3,
    title: 'Telemetri & Estimasi Panen',
    description:
      'Data intensitas lux, suhu udara, dan durasi penyinaran terakumulasi otomatis ke grafik analitik untuk membantu petani memprediksi jadwal panen.',
    outputLabel: 'Laporan siap unduh dan estimasi panen presisi',
  },
]

export function HowItWorksSection() {
  return (
    <SectionContainer className="py-20 md:py-24" id="how-it-works">
      <ScrollReveal direction="up" delay={50}>
        <div className="text-center mb-16 max-w-2xl mx-auto space-y-3">
          <div className={LANDING_STYLES.eyebrow}>
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
              <div className="group relative h-full rounded-2xl bg-white p-7 shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col justify-between text-left">
                {/* Header: Step Number & Focal Icon */}
                <div>
                  <div className="flex items-center justify-between pb-4">
                    <span className="text-3xl font-bold text-slate-300 tracking-tight select-none">
                      {step.stepNumber}
                    </span>
                    <div className={LANDING_STYLES.iconContainer}>
                      <IconComponent className={LANDING_STYLES.icon} strokeWidth={2.25} />
                    </div>
                  </div>

                  {/* Middle: Title & Description */}
                  <div className="space-y-2.5">
                    <h3 className="font-semibold text-base sm:text-lg text-slate-900 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Footer: Concrete Output Indicator without divider */}
                <div className="pt-4 text-xs text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-700">Output: </span>
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
            className={`${LANDING_BUTTONS.secondaryLight} gap-2 px-6 py-3 text-sm select-none`}
          >
            <span>Pelajari Alur Lengkap</span>
            <ArrowUpRight className={LANDING_STYLES.secondaryArrow} strokeWidth={2.25} />
          </Link>
        </ScrollReveal>
      </div>
    </SectionContainer>
  )
}
