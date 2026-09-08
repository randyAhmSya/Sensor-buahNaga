import { QrCode, Cpu, LineChart } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { SectionContainer } from '../../../components/common/SectionContainer'

const steps = [
  {
    step: '1',
    icon: QrCode,
    title: 'Install & Scan',
    description:
      'Pasang sensor pintar di area kebun dan pindai QR Code untuk mendaftarkan zona di aplikasi secara instan.',
  },
  {
    step: '2',
    icon: Cpu,
    title: 'Sistem Bekerja',
    description:
      'Sistem secara otomatis menyesuaikan intensitas cahaya dan mencatat akumulasi durasi penyinaran malam hari.',
  },
  {
    step: '3',
    icon: LineChart,
    title: 'Monitor & Analisis',
    description:
      'Pantau progress tanaman, kesehatan perangkat, dan akses laporan estimasi panen komprehensif dari dashboard.',
  },
]

export function HowItWorksSection() {
  return (
    <SectionContainer className="py-24" id="how-it-works">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <span className="text-emerald-700 font-semibold text-sm uppercase tracking-wider">
          Alur Sederhana
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-3 tracking-tight">
          Cara Kerja AgroLight
        </h2>
        <p className="text-slate-600">
          Tiga langkah mudah menuju efisiensi perkebunan maksimal tanpa konfigurasi rumit.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 relative">
        {steps.map((item, idx) => {
          const IconComponent = item.icon
          return (
            <Card
              key={idx}
              className="text-center bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col items-center relative group"
            >
              <div className="relative mb-6">
                <div className="w-14 h-14 bg-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                  <IconComponent className="w-7 h-7" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-950 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {item.step}
                </span>
              </div>

              <h3 className="font-bold text-xl text-slate-900 mb-3">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </Card>
          )
        })}
      </div>
    </SectionContainer>
  )
}
