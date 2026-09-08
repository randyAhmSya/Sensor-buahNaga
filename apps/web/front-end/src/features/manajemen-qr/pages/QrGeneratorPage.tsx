import { useState } from 'react'
import type { QrGeneratorFormValues } from '../../../schemas/qrSchema'
import mockQrData from '../../../services/mock/mockQr.json'
import type { KodeQrDTO } from '../../../types/database.types'
import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { QrPreviewCard } from '../components/QrPreviewCard'
import { QrPrintLayout } from '../components/QrPrintLayout'
import { QrGeneratorForm } from '../components/QrGeneratorForm'
import { QrCode, Printer } from 'lucide-react'

export function QrGeneratorPage() {
  const [stickers, setStickers] = useState<KodeQrDTO[]>(mockQrData as unknown as KodeQrDTO[])
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  const handleGenerate = (data: QrGeneratorFormValues) => {
    const newSticker: KodeQrDTO = {
      id_qr: `QR-${data.targetType.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      teks_kode_qr: `AGL-QR-${Math.floor(1000 + Math.random() * 9000)}-${data.blockId}`,
      status_qr: 'MENUNGGU_CETAK',
      tipe_target: data.targetType,
      id_target: data.targetType === 'Sensor' ? `SNR-${Math.floor(100 + Math.random() * 900)}` : data.blockId,
      terhubung_ke: `${data.targetName} (${data.blockId})`,
      blok_id: data.blockId,
      tanggal_generate: new Date().toISOString(),
      teknisi_pembuat: data.technicianName,
      catatan: data.notes,
    }

    setStickers((prev) => [newSticker, ...prev])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <QrCode className="h-6 w-6 text-emerald-600" />
            Manajemen & Generator Stiker QR Kebun
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate dan cetak label identifikasi fisik tahan cuaca untuk sensor, tiang naga, dan panel kontrol (Tabel: kode_qrs)
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPrintModalOpen(true)}
          leftIcon={<Printer className="h-4 w-4" />}
        >
          Pratinjau Lembar Cetak
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Generator Kolom Kiri */}
        <div className="lg:col-span-1">
          <QrGeneratorForm onGenerate={handleGenerate} />
        </div>

        {/* List Stiker Kolom Kanan */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">
              Daftar Stiker QR Terdaftar ({stickers.length})
            </h3>
            <span className="text-xs text-slate-500">Terintegrasi dengan sistem pemindaian kamera</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stickers.map((item) => (
              <QrPreviewCard key={item.id_qr} item={item} onPrintSingle={() => setIsPrintModalOpen(true)} />
            ))}
          </div>
        </div>
      </div>

      {/* Modal Cetak Lembar Stiker */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Pratinjau Cetak Lembar Stiker Outdoor"
        description="Gunakan printer label thermal outdoor atau stiker vinyl tahan air"
        maxWidth="xl"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          <QrPrintLayout items={stickers} />
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsPrintModalOpen(false)}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              window.print()
              setIsPrintModalOpen(false)
            }}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Cetak Dokumen
          </Button>
        </div>
      </Modal>
    </div>
  )
}
