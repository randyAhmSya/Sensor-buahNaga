import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface FormPageLayoutProps {
  breadcrumbs: React.ReactNode
  title: string
  backUrl: string
  backLabel?: string
  onSubmit: (e: React.FormEvent) => void
  submitLabel?: string
  isSubmitting?: boolean
  leftContent: React.ReactNode // Slot untuk form teks detail (7 Kolom)
  rightContent: React.ReactNode // Slot untuk upload media & status (5 Kolom)
}

export const FormPageLayout: React.FC<FormPageLayoutProps> = ({
  breadcrumbs,
  title,
  backUrl,
  backLabel = 'Kembali',
  onSubmit,
  submitLabel = 'Simpan Data',
  isSubmitting = false,
  leftContent,
  rightContent,
}) => {
  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-4 sm:pt-6">
      {/* Header & Breadcrumbs */}
      <div className="space-y-2">
        {breadcrumbs}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate(backUrl)}
            className="flex flex-row items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>{backLabel}</span>
          </Button>
        </div>
      </div>

      {/* Main Form 2 Kolom Grid */}
      <form onSubmit={onSubmit} className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Kolom Kiri: Detail Informasi (7 Kolom) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-6 h-full flex flex-col justify-between">
            {leftContent}
          </div>
        </div>

        {/* Kolom Kanan: Media, Status, & Aksi (5 Kolom) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          {rightContent}

          {/* Action Buttons */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="w-full flex flex-row items-center justify-center gap-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-xs whitespace-nowrap"
            >
              <Save className="w-5 h-5 shrink-0" />
              <span>{submitLabel}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate(backUrl)}
              className="w-full flex flex-row items-center justify-center border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold py-3.5 px-4 rounded-xl"
            >
              Batal
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
