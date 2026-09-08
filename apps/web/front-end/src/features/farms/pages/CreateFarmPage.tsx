import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { FarmItem } from '@/types/farm'
import { FormPageLayout } from '@/components/layout/FormPageLayout'
import { useCreateFarmPage } from '../hooks/useCreateFarmPage'
import { CreateFarmInfoSection } from '../components/CreateFarmInfoSection'
import { CreateFarmMediaSection } from '../components/CreateFarmMediaSection'

interface CreateFarmPageProps {
  onAddFarm?: (farm: FarmItem) => void
}

export const CreateFarmPage: React.FC<CreateFarmPageProps> = ({ onAddFarm }) => {
  const {
    formData,
    errors,
    imagePreview,
    handleTextChange,
    setStatus,
    handleImageFile,
    handleSubmit,
    setImagePreview,
  } = useCreateFarmPage({ onAddFarm })

  const breadcrumbs = (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <Link to="/admin/dashboard" className="hover:text-emerald-700 transition-colors">
        Beranda
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
      <Link to="/admin/farms" className="hover:text-emerald-700 transition-colors">
        Kebun & Blok
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
      <span className="text-slate-900 font-bold">Tambah Kebun Baru</span>
    </div>
  )

  return (
    <FormPageLayout
      breadcrumbs={breadcrumbs}
      title="Tambah Kebun Baru"
      backUrl="/admin/farms"
      backLabel="Kembali ke Daftar Kebun"
      onSubmit={handleSubmit}
      submitLabel="Simpan Kebun"
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
          onUrlChange={(url) => {
            handleTextChange('imageUrl', url)
            setImagePreview(url)
          }}
          onStatusChange={setStatus}
        />
      }
    />
  )
}

export default CreateFarmPage
