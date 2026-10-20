import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { FormPageLayout } from '@/components/layout/FormPageLayout'
import { useEditFarmPage } from '../hooks/useEditFarmPage'
import { CreateFarmInfoSection } from '../components/CreateFarmInfoSection'
import { CreateFarmMediaSection } from '../components/CreateFarmMediaSection'
import { Toast } from '@/components/feedback/Toast'

export const EditFarmPage: React.FC = () => {
  const {
    farmId,
    formData,
    errors,
    imagePreview,
    isLoading,
    isSubmitting,
    toast,
    setToast,
    handleTextChange,
    setStatus,
    handleImageFile,
    handleSubmit,
  } = useEditFarmPage()

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">Memuat data kebun...</p>
      </div>
    )
  }

  const breadcrumbs = (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
      <Link to="/kebun/dashboard" className="hover:text-emerald-700 transition-colors">
        Beranda
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <Link to="/kebun/farms" className="hover:text-emerald-700 transition-colors">
        Kebun & Blok
      </Link>
      {farmId && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link to={`/kebun/farms/${farmId}`} className="hover:text-emerald-700 transition-colors">
            {formData.name || 'Detail Kebun'}
          </Link>
        </>
      )}
      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span className="text-slate-900 font-bold">Edit Kebun</span>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi Feedback jika Error */}
      {toast && (
        <div className="fixed top-6 right-6 z-50">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <FormPageLayout
        breadcrumbs={breadcrumbs}
        title={`Edit ${formData.name || 'Kebun'}`}
        backUrl={farmId ? `/kebun/farms/${farmId}` : '/kebun/farms'}
        backLabel="Kembali ke Detail Kebun"
        onSubmit={handleSubmit}
        submitLabel="Simpan Perubahan"
        isSubmitting={isSubmitting}
        leftContent={
          <CreateFarmInfoSection
            formData={formData}
            errors={errors}
            onChange={handleTextChange}
          />
        }
        rightContent={
          <CreateFarmMediaSection
            formData={formData}
            errors={errors}
            imagePreview={imagePreview}
            onImageFileChange={handleImageFile}
            onStatusChange={setStatus}
          />
        }
      />
    </div>
  )
}

export default EditFarmPage
