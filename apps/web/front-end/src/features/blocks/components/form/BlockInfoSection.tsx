import { useState, useEffect, type FC } from 'react'
import { Info, Cpu, ChevronDown } from 'lucide-react'
import { InputField } from '@/components/form/InputField'
import { TextareaField } from '@/components/form/TextareaField'
import type { BlockFormInput } from '../../schemas/block.schema'
import { nodeService } from '@/services/nodeService'
import type { NodeSensorBackend } from '@/types/node.types'

interface BlockInfoSectionProps {
  formData: BlockFormInput
  errors: Partial<Record<keyof BlockFormInput, string>>
  farmId?: string
  farmName: string
  isEditMode?: boolean
  onChange: (field: keyof BlockFormInput, value: string) => void
}

export const BlockInfoSection: FC<BlockInfoSectionProps> = ({
  formData,
  errors,
  farmId,
  farmName,
  isEditMode = false,
  onChange,
}) => {
  const [availableNodes, setAvailableNodes] = useState<NodeSensorBackend[]>([])
  const [isLoadingNodes, setIsLoadingNodes] = useState(false)

  useEffect(() => {
    let isMounted = true
    setIsLoadingNodes(true)
    // Sertakan farmId jika ada, agar memanggil GET /api/petani/node?kebun_id=UUID
    nodeService
      .getAll(farmId)
      .then((nodes) => {
        if (isMounted) {
          setAvailableNodes(nodes || [])
        }
      })
      .catch(() => {
        if (isMounted) setAvailableNodes([])
      })
      .finally(() => {
        if (isMounted) setIsLoadingNodes(false)
      })
    return () => {
      isMounted = false
    }
  }, [farmId])

  const hasMatchedOption =
    !formData.nodeSensor ||
    availableNodes.some(
      (n) => n.id_sensor === formData.nodeSensor || n.kode_perangkat === formData.nodeSensor
    )

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

      {/* 2. Baris Luas Area & Dropdown Node Sensor Dinamis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="w-full space-y-1 text-left">
          <label
            htmlFor="select-nodeSensor"
            className="block text-sm font-semibold text-slate-800 mb-1.5"
          >
            Node Sensor IoT <span className="text-xs font-medium text-slate-600 ml-1">(Opsional)</span>
          </label>
          <div className="relative rounded-xl shadow-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Cpu className="w-4 h-4" />
            </div>
            <select
              id="select-nodeSensor"
              name="nodeSensor"
              value={formData.nodeSensor || ''}
              onChange={(e) => onChange('nodeSensor', e.target.value)}
              className="block w-full appearance-none rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              <option value="">-- Pilih Node Sensor (Opsional) --</option>
              {isLoadingNodes && <option disabled value="">Memuat daftar sensor...</option>}
              {!hasMatchedOption && formData.nodeSensor && (
                <option value={formData.nodeSensor}>{formData.nodeSensor} (Terhubung saat ini)</option>
              )}
              {availableNodes.map((node) => {
                const isSelected =
                  formData.nodeSensor === node.id_sensor ||
                  formData.nodeSensor === node.kode_perangkat
                const valueToUse = isSelected ? formData.nodeSensor : node.id_sensor
                return (
                  <option key={node.id_sensor} value={valueToUse}>
                    {node.kode_perangkat} {node.tipe_sensor ? `(${node.tipe_sensor})` : ''} - {node.status_koneksi || 'Offline'}
                  </option>
                )
              })}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          {errors.nodeSensor && (
            <p className="text-xs text-rose-600 font-medium mt-1">{errors.nodeSensor}</p>
          )}
        </div>
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
