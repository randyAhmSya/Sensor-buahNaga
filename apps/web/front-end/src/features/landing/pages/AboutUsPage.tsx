import { AlertTriangle, Lightbulb, BarChart3, Sprout, TrendingUp } from 'lucide-react'
import { Card } from '../../../components/ui/Card'
import { SectionContainer } from '../../../components/common/SectionContainer'
import { CtaBanner } from '../components/CtaBanner'

export const AboutUsPage = () => {
  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      <SectionContainer className="py-20" containerClassName="space-y-24">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Kenapa Kami Membangun AgroLight
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Lahir dari masalah nyata di lapangan. Kami melihat potensi besar dalam pertanian buah naga yang terhambat oleh inefisiensi pencahayaan malam hari dan kurangnya data operasional.
          </p>
        </section>

        {/* Problem Section (Kiri Teks, Kanan Gambar) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4 order-2 md:order-1">
            <div className="border border-amber-300 bg-amber-50/50 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Tantangan Petani</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Pencahayaan Konvensional yang Boros
            </h2>
            <p className="text-slate-600 leading-relaxed text-base">
              Penggunaan lampu sepanjang malam untuk merangsang pembungaan buah naga seringkali membuang energi secara berlebihan. Tanpa kontrol yang cerdas, biaya listrik melonjak. Selain itu, estimasi panen dilakukan secara manual dan rentan terhadap kesalahan, menyulitkan perencanaan bisnis.
            </p>
          </div>
          <Card className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[380px] order-1 md:order-2 bg-white p-0">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcB-m33ICZf9i8A6fE7Ssdsil1-Z5o3pLbss4TZINPIPnGeWe4_EK8GtupQaBg2QCNQLDmx-xFwuPQhduBzCyXP68yvW6spKXJjb2xC_RKA89RtGnQZqLNBmEfmrIsPh-HsIhmdtBIhO6oFtTUmvVzgwIAmBap53sL_BDPuYqrqzEWtPHoBVbXNcvNtEv8clpkCo_t45uD_yikg4FSE4hB88FajqUKOIkzQXwCoZTJ44mof2hJlDsMVg"
              alt="Inefisiensi Lampu Konvensional"
              loading="lazy"
            />
          </Card>
        </section>

        {/* Solution Section (Kiri Gambar, Kanan Teks) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Card className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[380px] bg-white p-0">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAT6yoEEWzj-HBMTCO6koCEPkpzsWbTB-NyMlEGd4o2Lo-NpNOqSjoVGeRI32zYh8rdW0uf953Ir74mYpPCfVGhYc8jwaHHRTyUpUenEdHO9NhmdF8n6BMXAasoZ11t_Frr-hnJ_VPvetg1otDpsSNTDNZhr187yl5EKZFB_avijxsKCYI7J4_YTojqPyGSX4N0hsqzqgTC_aKQQSLu2idcWY1_U64Lo7b5-tMkXO16-ubN0RaAWk4DBA"
              alt="Solusi Otomasi AgroLight"
              loading="lazy"
            />
          </Card>
          <div className="space-y-4">
            <div className="border border-emerald-600 bg-transparent text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
              <span>Solusi Cerdas</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Otomatisasi &amp; Presisi Data
            </h2>
            <p className="text-slate-600 leading-relaxed text-base">
              AgroLight menghadirkan sistem <em>auto-dimming</em> cerdas yang menyesuaikan intensitas cahaya berdasarkan kebutuhan aktual tanaman, menghemat energi secara signifikan. Didukung oleh sensor dan analitik data, sistem kami memberikan estimasi panen yang presisi untuk pengambilan keputusan yang lebih baik.
            </p>
          </div>
        </section>

        {/* Values Grid (3 Pilar Inti) */}
        <section className="bg-slate-50 border border-slate-200 rounded-3xl p-8 md:p-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Nilai Inti Kami
            </h2>
            <p className="text-slate-600 text-sm">
              Prinsip yang membimbing setiap pengembangan fitur AgroLight.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                Presisi Berbasis Data
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Keputusan operasional didorong oleh data real-time, bukan asumsi semata, guna memastikan efisiensi maksimal.
              </p>
            </Card>

            <Card className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                Sederhana untuk Petani
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Teknologi canggih dengan antarmuka yang intuitif dan praktis, dirancang khusus untuk kenyamanan tim lapangan.
              </p>
            </Card>

            <Card className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                Siap Berkembang
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Arsitektur sistem yang skalabel, siap mendukung ekspansi lahan dari perkebunan rintisan hingga skala industri.
              </p>
            </Card>
          </div>
        </section>
      </SectionContainer>

      {/* Banner CTA Bawah */}
      <CtaBanner />
    </div>
  )
}
