import { Card } from '../../../components/ui/Card'
import { CtaBanner } from '../components/CtaBanner'
import { HOW_IT_WORKS_STEPS } from '../../../constants/landing.constants'

export const HowItWorksPage = () => {
  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      {/* Konten Timeline */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Cara Kerja AgroLight
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Dari pemasangan hingga panen, semua terpantau otomatis dalam satu alur sederhana.
          </p>
        </header>

        {/* Vertical Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Garis Tengah */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 -translate-x-1/2" />

          <div className="space-y-16">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <div
                key={item.step}
                className="relative flex flex-col md:flex-row items-center gap-8"
              >
                {/* Left Column (Desktop) / Primary info */}
                {item.imageOnRight ? (
                  <div className="md:w-1/2 w-full pl-16 md:pl-0 md:pr-12 text-left md:text-right order-2 md:order-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ) : (
                  <div className="md:w-1/2 w-full pl-16 md:pl-0 md:pr-12 order-3 md:order-1">
                    <Card className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs h-52 bg-white p-0">
                      <img
                        className="w-full h-full object-cover"
                        src={item.imageUrl}
                        alt={item.imageAlt}
                        loading="lazy"
                      />
                    </Card>
                  </div>
                )}

                {/* Number Badge Indicator */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full bg-emerald-700 text-white font-bold text-lg border-4 border-white shadow-md z-10 select-none">
                  {item.step}
                </div>

                {/* Right Column (Desktop) */}
                {item.imageOnRight ? (
                  <div className="md:w-1/2 w-full pl-16 md:pl-12 order-3">
                    <Card className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs h-52 bg-white p-0">
                      <img
                        className="w-full h-full object-cover"
                        src={item.imageUrl}
                        alt={item.imageAlt}
                        loading="lazy"
                      />
                    </Card>
                  </div>
                ) : (
                  <div className="md:w-1/2 w-full pl-16 md:pl-12 text-left order-2 md:order-3">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CtaBanner HARUS berada di paling bawah alur dokumen */}
      <CtaBanner />
    </div>
  )
}
