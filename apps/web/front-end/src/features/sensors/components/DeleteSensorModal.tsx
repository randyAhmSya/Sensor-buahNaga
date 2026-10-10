import type { FC } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import type { SensorNodeItem } from '@/types/sensor.types'

interface DeleteSensorModalProps {
  isOpen: boolean
  sensor: SensorNodeItem | null
  isDeleting: boolean
  onClose: () => void
  onConfirm: (sensorId: string, nodeCode: string) => Promise<void>
}

export const DeleteSensorModal: FC<DeleteSensorModalProps> = ({
  isOpen,
  sensor,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!sensor) return null

  const handleConfirm = async () => {
    await onConfirm(sensor.id, sensor.nodeCode)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hapus Node Sensor"
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-950">Konfirmasi Penghapusan Perangkat</h4>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              Apakah Anda yakin ingin menghapus sensor <strong className="underline">{sensor.nodeCode}</strong> di {sensor.farmName} ({sensor.blockName})?
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed px-1">
          Tindakan ini akan melepaskan pemasangan perangkat dari blok lahan. Riwayat telemetri lux dan suhu terkait perangkat ini tidak akan lagi ditampilkan pada pemantauan real-time.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            isLoading={isDeleting}
            onClick={handleConfirm}
            leftIcon={<Trash2 className="w-4 h-4" />}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
          >
            Hapus Sensor
          </Button>
        </div>
      </div>
    </Modal>
  )
}
