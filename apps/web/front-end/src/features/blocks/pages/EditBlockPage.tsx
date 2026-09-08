import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { FormPageLayout } from '@/components/layout/FormPageLayout'
import { useBlockForm } from '../hooks/useBlockForm'
import { BlockInfoSection } from '../components/form/BlockInfoSection'
import { BlockMediaSection } from '../components/form/BlockMediaSection'
import { blockService } from '@/services/blockService'
import type { BlockFormInput } from '../schemas/block.schema'

export const EditBlockPage: React.FC = () => {
  const { farmId, blockId } = useParams<{ farmId: string; blockId: string }>()
  const effectiveFarmId = farmId || 'farm-1'
  const effectiveBlockId = blockId || 'blk-1'

  const [initialData, setInitialData] = useState<BlockFormInput | null>(null)
  const [farmName, setFarmName] = useState<string>('Kebun')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    blockService.getById(effectiveFarmId, effectiveBlockId).then((block) => {
      setFarmName(block.farmName)
      setInitialData({
        name: block.name,
        nodeSensor: block.deviceId,
        description: 'Fase pertumbuhan awal buah naga dengan jadwal penyinaran malam hari.',
        imageUrl: block.bannerUrl,
        status: block.deviceStatus,
        area: block.area.replace(/[^\d.]/g, ''),
        harvestEstimate: block.harvestCycle?.harvestEstimate || '',
      })
      setIsLoading(false)
    })
  }, [effectiveFarmId, effectiveBlockId])

  if (isLoading || !initialData) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-500">Memuat data blok...</p>
      </div>
    )
  }

  return (
    <EditBlockPageContent
      farmId={effectiveFarmId}
      blockId={effectiveBlockId}
      farmName={farmName}
      initialData={initialData}
    />
  )
}

interface EditBlockPageContentProps {
  farmId: string
  blockId: string
  farmName: string
  initialData: BlockFormInput
}

const EditBlockPageContent: React.FC<EditBlockPageContentProps> = ({
  farmId,
  blockId,
  farmName,
  initialData,
}) => {
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
  } = useBlockForm(farmId, initialData, true, blockId)

  const breadcrumbs = (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto whitespace-nowrap">
      <Link to="/admin/farms" className="hover:text-emerald-700 transition-colors">
        Kebun & Blok
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <Link to={`/admin/farms/${farmId}`} className="hover:text-emerald-700 transition-colors">
        {farmName}
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <Link
        to={`/admin/farms/${farmId}/blocks/${blockId}`}
        className="hover:text-emerald-700 transition-colors"
      >
        {formData.name}
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <span className="text-slate-900 font-bold">Edit Blok</span>
    </div>
  )

  return (
    <FormPageLayout
      breadcrumbs={breadcrumbs}
      title={`Edit ${formData.name || 'Blok'}`}
      backUrl={`/admin/farms/${farmId}/blocks/${blockId}`}
      backLabel="Kembali ke Detail Blok"
      onSubmit={submit}
      submitLabel="Simpan Perubahan"
      isSubmitting={isSubmitting}
      leftContent={
        <BlockInfoSection
          formData={formData}
          errors={errors}
          farmName={farmName}
          isEditMode={true}
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

export default EditBlockPage
