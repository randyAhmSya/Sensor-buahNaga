import React from 'react';
import { Eye, Trash2 } from 'lucide-react';
import type { QRCodeItem } from '@/data/mockQRCodes';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface QRCodeTableProps {
  items: QRCodeItem[];
  onViewDetail: (item: QRCodeItem) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (item: QRCodeItem) => void;
}

export const QRCodeTable: React.FC<QRCodeTableProps> = ({
  items,
  onViewDetail,
  onToggleStatus,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">Thumbnail</th>
              <th className="py-4 px-6">Kode Teks</th>
              <th className="py-4 px-6">Lokasi Blok & Kebun</th>
              <th className="py-4 px-6">Status Perangkat</th>
              <th className="py-4 px-6">Tanggal Dibuat</th>
              <th className="py-4 px-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-6">
                    <button
                      type="button"
                      onClick={() => onViewDetail(item)}
                      className="w-11 h-11 rounded-xl border border-slate-200 bg-white p-1 hover:border-emerald-600 transition-colors block cursor-pointer"
                    >
                      <img
                        src={item.qrImageUrl}
                        alt={`QR ${item.codeText}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  </td>
                  <td className="py-3 px-6 font-bold text-slate-900 tracking-tight font-mono">
                    {item.codeText}
                  </td>
                  <td className="py-3 px-6">
                    <div className="font-semibold text-slate-800">{item.blockName}</div>
                    <div className="text-xs text-slate-500">{item.farmName}</div>
                  </td>
                  <td className="py-3 px-6">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(item.id)}
                      className="cursor-pointer transition-transform active:scale-95 block"
                      title="Klik untuk mengubah status"
                    >
                      <StatusBadge
                        status={item.status}
                        variant={item.status === 'Aktif' ? 'active' : 'standby'}
                      />
                    </button>
                  </td>
                  <td className="py-3 px-6 text-xs text-slate-600 font-medium">
                    {item.createdAt}
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetail(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Lihat Detail & Cetak QR"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus QR Code"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12 text-sm text-slate-500 font-medium">
                  Tidak ada QR Code yang cocok dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
