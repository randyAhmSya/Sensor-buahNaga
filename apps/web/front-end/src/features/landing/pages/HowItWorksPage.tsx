import { MapPin, QrCode, Lightbulb, Calendar } from 'lucide-react'
import { SectionContainer } from '../../../components/common/SectionContainer'
import { Card } from '../../../components/ui/Card'
import { ScrollReveal } from '../components/ScrollReveal'
import { CtaBanner } from '../components/CtaBanner'

export function HowItWorksPage() {
  const stages = [
    {
      step: '01',
      icon: MapPin,
      title: 'Pemetaan Kebun & Blok Lahan',
      description:
        'Petani mendaftarkan data kebun, membagi petak menjadi blok-blok terorganisir, dan menentukan kuota tiang lampu pada antarmuka web dashboard.',
      output: 'Peta digital kebun buah naga siap dikonfigurasi.',
    },
    {
      step: '02',
      icon: QrCode,
      title: 'Instalasi Fisik & Pairing QR Tiang Sensor',
      description:
        'Pemasangan node sensor ESP32 pada tiang lampu lapangan. Cukup pindai kode QR fisik tiang melalui aplikasi Android untuk menghubungkan perangkat secara instan.',
      output: 'Node sensor aktif dan terhubung ke gateway via protokol MQTT.',
    },
    {
      step: '03',
      icon: Lightbulb,
      title: 'Pengaturan Jadwal Penyinaran Malam Hari',
      description:
        'Atur jadwal aktif lampu induksi bunga sesuai fase vegetatif atau generatif tanaman. Fitur auto-dimming secara cerdas menyesuaikan tingkat kecerahan lampu.',
      output: 'Otomasi penyinaran berjalan mandiri tanpa intervensi manual malam hari.',
    },
    {
      step: '04',
      icon: Calendar,
      title: 'Pemantauan Energi Harian & Evaluasi Estimasi Panen',
      description:
        'Pantau konsumsi daya listrik harian, pantau kestabilan suhu sekitar tanaman, dan dapatkan kalkulasi tanggal panen otomatis berbasis akumulasi hari penyinaran.',
      output: 'Efisiensi listrik terukur dan kepastian jadwal panen buah naga.',
    },
  ]

  const checklistItems = [
    {
      title: 'Jalur Listrik Stabil',
      desc: 'Pastikan ketersediaan pasokan listrik 220V yang stabil di sepanjang jalur tiang lampu kebun untuk menjaga keawetan lampu dan modul sensor.',
    },
    {
      title: 'Koneksi Gateway Lapangan',
      desc: 'Sediakan jangkauan WiFi kebun atau modem seluler dengan kartu SIM aktif di lokasi gateway untuk menjamin transmisi telemetri tanpa hambatan.',
    },
    {
      title: 'Penomoran Tiang Kebun',
      desc: 'Lakukan penomoran fisik pada tiang lampu yang dipasangi node sensor agar sinkron dengan stiker QR dan mempermudah inspeksi rutin tim lapangan.',
    },
  ]

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-slate-50">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <ScrollReveal direction="up" delay={50}>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              TAHAPAN IMPLEMENTASI
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={100}>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Cara Kerja AgroLight di Kebun
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={150}>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Dari pemetaan awal lahan, instalasi tiang sensor di lapangan, hingga evaluasi panen terukur dalam satu siklus terintegrasi.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* 4 Stages Timeline / Grid */}
      <SectionContainer className="py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <ScrollReveal direction="up" delay={50}>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              ALUR LENGKAP
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={100}>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Empat Tahap Menuju Otomasi Penuh
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={150}>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Panduan implementasi bertahap untuk memastikan sistem IoT bekerja maksimal di kebun Anda.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {stages.map((stage, idx) => {
            const Icon = stage.icon
            return (
              <ScrollReveal key={stage.step} direction="up" delay={100 + idx * 75}>
                <Card className="h-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                        <Icon className="w-7 h-7" strokeWidth={2.25} />
                      </div>
                      <span className="text-2xl font-bold text-slate-300">
                        {stage.step}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                      {stage.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {stage.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-emerald-700 block mb-0.5">
                      Hasil Tahapan:
                    </span>
                    {stage.output}
                  </div>
                </Card>
              </ScrollReveal>
            )
          })}
        </div>
      </SectionContainer>

      {/* Field Readiness Checklist */}
      <section className="bg-white border-y border-slate-200 py-16 md:py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <ScrollReveal direction="up" delay={50}>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                PERSIAPAN AWAL
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={100}>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Checklist Kesiapan Lapangan
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150}>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Tiga aspek penting yang perlu dipersiapkan sebelum perangkat AgroLight dipasang di kebun Anda.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {checklistItems.map((item, idx) => (
              <ScrollReveal key={item.title} direction="up" delay={100 + idx * 75}>
                <div className="h-full p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-sm font-bold text-emerald-600 mb-3 block">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CtaBanner />
    </div>
  )
}
export default HowItWorksPage
