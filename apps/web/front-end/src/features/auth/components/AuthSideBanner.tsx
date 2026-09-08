import type { FC } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { BrandLogo } from '@/components/common/BrandLogo'

interface AuthSideBannerProps {
  title: string
  description: string
  highlights: string[]
  imageUrl?: string
}

export const AuthSideBanner: FC<AuthSideBannerProps> = ({
  title,
  description,
  highlights,
  imageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAB7CN0kpn3VsCmcKjYLy_BWfo8AYolr_bHvPqqC4iI2HmcJDriIXPte56Pj2LsSYFuSLdkf1cx37MEpYGY_K-yZySU2eIv9cBHTTjTj49rVlgADh7F2YZW2zshrkDT9qiZ-sj0ZqmchUjyDsQ5Mg96sEg1wpFg5rEL063CXLnJS652kJZAipm0vF5WkDyxhV71sKMCjLPR3tb4tsVEz8qmh0mlg20hbQfcjwQXJ9S5QpT1uecbd1Wd4w',
}) => {
  return (
    <div className="hidden md:flex flex-col w-[45%] bg-emerald-950 p-12 justify-between relative overflow-hidden">
      <div className="z-10">
        <BrandLogo variant="light" textSize="text-2xl" />
      </div>

      <div className="z-10 my-auto max-w-md space-y-4">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
          {title}
        </h1>
        <p className="text-emerald-100/80 text-base leading-relaxed">
          {description}
        </p>
        <div className="pt-4 space-y-3">
          {highlights.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-white text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="z-10 text-xs text-emerald-200/60">
        &copy; {new Date().getFullYear()} AgroLight Automation. Hak Cipta Dilindungi.
      </div>

      {/* Background image & gradient overlay */}
      <img
        src={imageUrl}
        alt="Kebun Buah Naga Malam Hari"
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/70 to-emerald-950/50 z-0" />
    </div>
  )
}
