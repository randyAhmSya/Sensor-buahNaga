import type { KodeQrDTO } from '../../../types/database.types'
import { QrCode as QrIcon } from 'lucide-react'

interface QrPrintLayoutProps {
  items: KodeQrDTO[]
}

export function QrPrintLayout({ items }: QrPrintLayoutProps) {
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto print:p-0">
      <div className="mb-6 pb-4 border-b border-slate-300 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Lembar Cetak Stiker QR Tag AgroLight</h2>
          <p className="text-xs text-slate-500">Stiker Vinyl Tahan Air & UV Kebun Buah Naga (Tabel: kode_qrs)</p>
        </div>
        <span className="text-xs font-mono text-slate-400">Total: {items.length} Label</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.id_qr}
            className="border-2 border-slate-900 rounded-lg p-4 flex flex-col items-center text-center bg-white"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">
              AGROLIGHT IoT SYSTEM
            </span>
            <div className="my-2 p-1.5 border border-slate-300 rounded-sm">
              <QrIcon className="h-28 w-28 text-black" />
            </div>
            <span className="text-xs font-mono font-bold text-black">{item.teks_kode_qr}</span>
            <span className="text-[11px] font-medium text-slate-700 mt-1 line-clamp-1">
              {item.terhubung_ke}
            </span>
            <span className="text-[9px] text-slate-500 mt-0.5">ID: {item.id_qr}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
