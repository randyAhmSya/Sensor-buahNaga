import type { FC } from 'react'
import { Info } from 'lucide-react'
import { InputField } from '@/components/form/InputField'
import { TextareaField } from '@/components/form/TextareaField'
import type { BlockFormInput } from '../../schemas/block.schema'

interface BlockInfoSectionProps {
  formData: BlockFormInput
  errors: Partial<Record<keyof BlockFormInput, string>>
  farmName: string
  isEditMode?: boolean
  onChange: (field: keyof BlockFormInput, value: string) => void
}

export const BlockInfoSection: FC<BlockInfoSectionProps> = ({
  formData,
  errors,
  farmName,
  isEditMode = false,
  onChange,
}) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
        <Info className="w-5 h-5 text-emerald-700 shrink-0" />
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {isEditMode ? 'Edit Informasi Blok' : 'Informasi Detail Blok'}
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Lokasi Kebun: <span className="text-slate-800 font-semibold">{farmName}</span>
          </p>
        </div>
      </div>

      {/* 1. Nama Blok */}
      <InputField
        name="name"
        label="Nama Blok"
        required
        value={formData.name}
        onChange={(e) => onChange('name', e.target.value)}
        placeholder="Contoh: Blok A - Vegetatif"
        error={errors.name}
      />

      {/* 2. Baris Luas Area & ID Node Sensor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          name="nodeSensor"
          label="ID Node Sensor IoT"
          required
          value={formData.nodeSensor}
          onChange={(e) => onChange('nodeSensor', e.target.value)}
          placeholder="Contoh: Node-01A"
          error={errors.nodeSensor}
        />
        <InputField
          name="area"
          label={
            <>
              Luas Area (m²) <span className="text-xs font-normal text-slate-500 ml-1">(Opsional)</span>
            </>
          }
          value={formData.area || ''}
          onChange={(e) => onChange('area', e.target.value)}
          placeholder="Contoh: 500 (Opsional)"
          error={errors.area}
        />
      </div>

      {/* 3. Estimasi Panen */}
      <InputField
        name="harvestEstimate"
        label={
          <>
            Estimasi Panen <span className="text-xs font-normal text-slate-500 ml-1">(Opsional)</span>
          </>
        }
        value={formData.harvestEstimate || ''}
        onChange={(e) => onChange('harvestEstimate', e.target.value)}
        placeholder="Contoh: 24 Nov 2026 (Opsional)"
        error={errors.harvestEstimate}
      />

      {/* 4. Keterangan Blok */}
      <TextareaField
        name="description"
        label="Keterangan Blok"
        required
        rows={4}
        value={formData.description}
        onChange={(e) => onChange('description', e.target.value)}
        placeholder="Jelaskan kondisi tanaman buah naga, siklus lampu malam, atau catatan blok..."
        error={errors.description}
      />
    </div>
  )
}
