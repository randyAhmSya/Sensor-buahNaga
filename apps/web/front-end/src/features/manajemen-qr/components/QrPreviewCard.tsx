import { QrCode as QrIcon, Printer, Tag } from 'lucide-react'
import type { KodeQrDTO } from '../../../types/database.types'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { formatDate } from '../../../utils/formatters'

interface QrPreviewCardProps {
  item: KodeQrDTO
  onPrintSingle?: (item: KodeQrDTO) => void
}

export function QrPreviewCard({ item, onPrintSingle }: QrPreviewCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TERCETAK':
        return <Badge variant="success">Tercetak</Badge>
      case 'MENUNGGU_CETAK':
        return <Badge variant="warning">Menunggu</Badge>
      case 'GAGAL':
        return <Badge variant="danger">Gagal</Badge>
      case 'RUSAK':
        return <Badge variant="danger">Rusak</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
      <div>
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Stiker {item.tipe_target}
              </span>
              <p className="text-xs font-mono font-bold text-slate-800">{item.id_qr}</p>
            </div>
          </div>
          {getStatusBadge(item.status_qr)}
        </div>

        {/* Visual QR Code Representation */}
        <div className="my-4 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <div className="p-3 bg-white rounded-lg shadow-xs border border-slate-200">
            <QrIcon className="h-20 w-20 text-slate-900" />
          </div>
          <span className="mt-2 text-[10px] font-mono text-slate-500 font-semibold">
            {item.teks_kode_qr}
          </span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600">
          <p className="font-semibold text-slate-900 line-clamp-1">{item.terhubung_ke}</p>
          <p className="text-[11px] text-slate-500">
            Tanggal: {formatDate(item.tanggal_generate)}
          </p>
          {item.teknisi_pembuat && (
            <p className="text-[11px] text-slate-500">
              Teknisi: <span className="text-slate-700 font-medium">{item.teknisi_pembuat}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={() => onPrintSingle?.(item)}
          leftIcon={<Printer className="h-3.5 w-3.5" />}
        >
          Cetak Label Stiker
        </Button>
      </div>
    </div>
  )
}
