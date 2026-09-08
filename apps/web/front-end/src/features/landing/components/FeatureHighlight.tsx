import { Activity, Sun, QrCode, Shield, Layers, BarChart3 } from 'lucide-react'

export function FeatureHighlight() {
  const features = [
    {
      icon: <Sun className="h-6 w-6 text-amber-500" />,
      title: 'Akumulasi Dosis Radiasi Lux-Jam',
      desc: 'Otomatis menghitung dosis radiasi harian dan musiman pohon buah naga untuk memicu induksi pembungaan serentak di luar musim (off-season).',
    },
    {
      icon: <Activity className="h-6 w-6 text-emerald-500" />,
      title: 'Monitoring Kesehatan Sensor Telemetri',
      desc: 'Deteksi dini degradasi baterai, penurunan tegangan panel surya, anomali fotodioda sensor, dan kualitas sinyal LoRaWAN.',
    },
    {
      icon: <QrCode className="h-6 w-6 text-indigo-500" />,
      title: 'Manajemen Stiker QR Lapangan',
      desc: 'Sistem cetak label QR tahan air outdoor untuk identifikasi tiang sulur beton, sensor PAR-Lux, dan modul saklar relay.',
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-rose-500" />,
      title: 'Prediksi Panen & Kemanisan Brix',
      desc: 'Algoritma estimasi tanggal petik optimum berdasarkan kurva pematangan kumulatif cahaya untuk mencegah buah lewat matang.',
    },
    {
      icon: <Layers className="h-6 w-6 text-sky-500" />,
      title: 'Manajemen Multi-Tenant & Kebun',
      desc: 'Arsitektur B2B multi-perkebunan untuk mengelola ratusan blok lahan, puluhan teknisi, dan ribuan pohon buah naga.',
    },
    {
      icon: <Shield className="h-6 w-6 text-teal-500" />,
      title: 'Role-Based Access Control',
      desc: 'Akses berjenjang khusus untuk Admin Perkebunan, Petani Lapangan, serta Ahli Agronomi dan Peneliti Hortikultura.',
    },
  ]

  return (
    <div id="fitur" className="py-20 bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">
            Kapabilitas Unggulan
          </h2>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Didesain Khusus untuk Karakteristik Budidaya Buah Naga Modern
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Kombinasi teknologi agronomis dan telemetri IoT industri guna memaksimalkan profitabilitas kebun Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group"
            >
              <div className="p-3 rounded-xl bg-slate-50 w-fit mb-4 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
