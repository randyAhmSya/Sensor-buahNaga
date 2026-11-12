import { Download, QrCode, WifiOff, BellRing } from 'lucide-react'
import { SectionContainer } from '../../../components/common/SectionContainer'
import { Card } from '../../../components/ui/Card'
import { ScrollReveal } from '../components/ScrollReveal'
import { CtaBanner } from '../components/CtaBanner'

export function DownloadAppPage() {
  const advantages = [
    {
      icon: QrCode,
      title: 'Pemindaian QR Tiang Sensor',
      description:
        'Arahkan kamera ponsel ke kode QR pada tiang untuk registrasi node dan monitoring status blok secara instan di lapangan.',
    },
    {
      icon: WifiOff,
      title: 'Operasional Offline-Ready',
      description:
        'Aplikasi tetap responsif menyimpan data operasional lokal saat Anda berada di sudut kebun dengan sinyal seluler lemah.',
    },
    {
      icon: BellRing,
      title: 'Peringatan & Notifikasi Lapangan',
      description:
        'Dapatkan notifikasi langsung jika terdeteksi anomali catu daya, lampu padam, atau kondisi suhu di luar batas aman.',
    },
  ]

  const installSteps = [
    {
      step: '01',
      title: 'Unduh Berkas Aplikasi',
      description:
        'Tekan tombol Unduh Aplikasi untuk mengunduh paket instalasi AgroLight.apk ke perangkat Android Anda.',
    },
    {
      step: '02',
      title: 'Izinkan Sumber Instalasi',
      description:
        'Buka berkas unduhan pada ponsel Android dan berikan izin instalasi dari sumber ini pada menu pengaturan.',
    },
    {
      step: '03',
      title: 'Buka dan Masuk ke Akun',
      description:
        'Jalankan aplikasi AgroLight dan masuk dengan akun petani Anda untuk mengelola perangkat kebun buah naga.',
    },
  ]

  return (
    <div className="w-full flex-1 flex flex-col justify-between bg-slate-50">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-20 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <ScrollReveal direction="up" delay={50}>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              APLIKASI LAPANGAN ANDROID
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={100}>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Unduh AgroLight Mobile
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={150}>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Pantau sensor, scan QR tiang kebun, dan terima peringatan langsung di genggaman Anda.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Download Card */}
      <SectionContainer className="py-12 md:py-16">
        <ScrollReveal direction="up" delay={100}>
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 text-white shadow-xl max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-semibold">
                  <span>Rilis Resmi Android</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Siap Digunakan di Kebun
                </h2>
                <p className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed">
                  Berkas APK terverifikasi aman untuk smartphone Android versi 8.0 ke atas. Dilengkapi panduan instalasi langkah demi langkah.
                </p>

                {/* Spesifikasi Teknis Bersih (Grid terstruktur tanpa tumpukan pill badge) */}
                <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-0.5">
                      Sistem Operasi
                    </span>
                    <span className="text-slate-200 font-semibold text-xs sm:text-sm">
                      Android 8.0+ (Oreo atau lebih baru)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-0.5">
                      Versi Rilis
                    </span>
                    <span className="text-slate-200 font-semibold text-xs sm:text-sm">
                      Versi 1.0.0
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider mb-0.5">
                      Kebutuhan Perangkat
                    </span>
                    <span className="text-slate-200 font-semibold text-xs sm:text-sm">
                      Akses Kamera (QR) &amp; Internet
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center gap-3">
                <a
                  href="/agrolight.apk"
                  download="AgroLight.apk"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base transition-colors shadow-lg active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  <span>Unduh Aplikasi</span>
                </a>
                <span className="text-xs text-slate-400">
                  Unduhan langsung berkas APK resmi
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </SectionContainer>

      {/* 3 Field Advantages */}
      <section className="bg-white border-y border-slate-200 py-16 md:py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <ScrollReveal direction="up" delay={50}>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                FITUR KHUSUS OPERASIONAL LAPANGAN
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={100}>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Keunggulan Aplikasi Mobile
              </h2>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={150}>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Dirancang khusus untuk membantu aktivitas harian petani di area kebun buah naga secara praktis.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {advantages.map((adv, idx) => {
              const Icon = adv.icon
              return (
                <ScrollReveal key={adv.title} direction="up" delay={100 + idx * 75}>
                  <Card className="h-full bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm mb-4">
                      <Icon className="w-7 h-7" strokeWidth={2.25} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                      {adv.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {adv.description}
                    </p>
                  </Card>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* 3 Installation Steps */}
      <SectionContainer className="py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <ScrollReveal direction="up" delay={50}>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
              PANDUAN INSTALASI
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={100}>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Tiga Langkah Mudah Pemasangan
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={150}>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Ikuti petunjuk sederhana ini untuk mulai menggunakan AgroLight Mobile di ponsel pintar Anda.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {installSteps.map((item, idx) => (
            <ScrollReveal key={item.step} direction="up" delay={100 + idx * 75}>
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
                <span className="font-mono text-sm font-bold text-emerald-600 block">
                  {item.step}
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </SectionContainer>

      {/* CTA Banner */}
      <CtaBanner />
    </div>
  )
}
export default DownloadAppPage
