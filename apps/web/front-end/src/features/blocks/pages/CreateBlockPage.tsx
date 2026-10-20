import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { FormPageLayout } from '@/components/layout/FormPageLayout'
import { useBlockForm } from '../hooks/useBlockForm'
import { BlockInfoSection } from '../components/form/BlockInfoSection'
import { BlockMediaSection } from '../components/form/BlockMediaSection'
import { farmService } from '@/services/farmService'

export const CreateBlockPage: React.FC = () => {
  const params = useParams<{ farmId?: string; id?: string }>()
  const effectiveFarmId = (params.farmId ?? params.id ?? '').trim()
  const [farmName, setFarmName] = useState<string>('Kebun')

  useEffect(() => {
    if (!effectiveFarmId) return
    farmService.getById(effectiveFarmId).then((farm) => {
      if (farm) setFarmName(farm.name)
    })
  }, [effectiveFarmId])

  const {
    formData,
    errors,
    isSubmitting,
    imagePreview,
    setImagePreview,
    updateField,
    setStatus,
    handleImageFile,
    submit,
  } = useBlockForm(effectiveFarmId)

  const breadcrumbs = (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
      <Link to="/kebun/farms" className="hover:text-emerald-700 transition-colors">
        Kebun & Blok
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <Link to={`/kebun/farms/${effectiveFarmId}`} className="hover:text-emerald-700 transition-colors">
        {farmName}
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span className="text-slate-900 font-bold">Tambah Blok Baru</span>
    </div>
  )

  return (
    <FormPageLayout
      breadcrumbs={breadcrumbs}
      title="Tambah Blok Baru"
      backUrl={`/kebun/farms/${effectiveFarmId}`}
      backLabel="Kembali ke Detail Kebun"
      onSubmit={submit}
      submitLabel="Simpan Blok"
      isSubmitting={isSubmitting}
      leftContent={
        <BlockInfoSection
          formData={formData}
          errors={errors}
          farmId={effectiveFarmId}
          farmName={farmName}
          isEditMode={false}
          onChange={updateField}
        />
      }
      rightContent={
        <BlockMediaSection
          formData={formData}
          errors={errors}
          imagePreview={imagePreview}
          onImageFileChange={handleImageFile}
          onUrlChange={(url) => {
            updateField('imageUrl', url)
            setImagePreview(url)
          }}
          onStatusChange={setStatus}
        />
      }
    />
  )
}

export default CreateBlockPage
