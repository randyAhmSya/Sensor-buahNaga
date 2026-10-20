import React from 'react';
import { Eye, Trash2, MapPin, Cpu, Calendar } from 'lucide-react';
import type { QRCodeItem } from '@/types/qr.types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ResponsiveDataTable, type ColumnDef } from '@/components/ui/ResponsiveDataTable';

interface QRCodeTableProps {
  items: QRCodeItem[];
  isLoading?: boolean;
  onViewDetail: (item: QRCodeItem) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (item: QRCodeItem) => void;
}

export const QRCodeTable: React.FC<QRCodeTableProps> = ({
  items,
  isLoading = false,
  onViewDetail,
  onToggleStatus,
  onDelete,
}) => {
  const columns: ColumnDef<QRCodeItem>[] = [
    {
      header: 'Thumbnail',
      cell: (item) => (
        <button
          type="button"
          onClick={() => onViewDetail(item)}
          className="w-12 h-12 rounded-xl border border-slate-200 bg-white p-1 hover:border-emerald-600 transition-colors block cursor-pointer active:scale-95"
          title="Lihat QR Code"
          aria-label={`Lihat QR Code ${item.codeText}`}
        >
          <img
            src={item.qrImageUrl}
            alt={`QR ${item.codeText}`}
            className="w-full h-full object-contain"
          />
        </button>
      ),
    },
    {
      header: 'Kode Teks',
      cell: (item) => (
        <span className="font-bold text-slate-900 tracking-tight font-mono text-sm">
          {item.codeText}
        </span>
      ),
    },
    {
      header: 'Lokasi Blok & Kebun',
      cell: (item) => {
        const isInstalled =
          item.blockName &&
          item.blockName.trim() !== '' &&
          item.blockName !== 'Belum terpasang' &&
          item.blockName !== 'Semua Blok';

        if (!isInstalled) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium italic">
              Belum terpasang
            </span>
          );
        }

        return (
          <div className="space-y-0.5">
            <div className="font-semibold text-slate-800 text-sm">{item.blockName}</div>
            {item.farmName ? (
              <div className="text-xs text-slate-500">{item.farmName}</div>
            ) : null}
            {item.nodeSensorName ? (
              <div className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 inline-block mt-0.5">
                Node: {item.nodeSensorName}
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      header: 'Status Perangkat',
      cell: (item) => (
        <StatusBadge
          status={item.status}
          variant={item.status === 'Aktif' ? 'active' : 'standby'}
        />
      ),
    },
    {
      header: 'Tanggal Dibuat',
      cell: (item) => (
        <span className="text-xs text-slate-600 font-medium">
          {item.createdAt}
        </span>
      ),
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (item) => (
        <div className="flex items-center justify-center gap-2">
          {/* Toggle Switch Aktif/Nonaktif */}
          <div
            className="flex items-center p-1"
            title={
              item.status === 'Aktif'
                ? 'Aktif (klik untuk nonaktifkan)'
                : 'Nonaktif (klik untuk aktifkan)'
            }
          >
            <button
              type="button"
              role="switch"
              aria-checked={item.status === 'Aktif'}
              onClick={() => onToggleStatus(item.id)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 ${
                item.status === 'Aktif' ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
              aria-label={`Ubah status ${item.codeText} menjadi ${item.status === 'Aktif' ? 'Nonaktif' : 'Aktif'}`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  item.status === 'Aktif' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Lihat Detail & Cetak */}
          <button
            type="button"
            onClick={() => onViewDetail(item)}
            className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer active:scale-95"
            title="Lihat Detail & Cetak QR"
            aria-label="Lihat Detail & Cetak QR"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Hapus */}
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="w-10 h-10 inline-flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer active:scale-95"
            title="Hapus QR Code"
            aria-label="Hapus QR Code"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <ResponsiveDataTable<QRCodeItem>
      columns={columns}
      data={items}
      keyExtractor={(item) => item.id}
      isLoading={isLoading}
      emptyMessage="Tidak ada QR Code yang cocok"
      emptySubMessage="Coba sesuaikan kata kunci pencarian atau filter kebun."
      tableMinWidth="min-w-[760px]"
      renderMobileCard={(item) => {
        const isInstalled =
          item.blockName &&
          item.blockName.trim() !== '' &&
          item.blockName !== 'Belum terpasang' &&
          item.blockName !== 'Semua Blok';

        return (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3.5">
            {/* Top row: QR Thumbnail, Code, Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onViewDetail(item)}
                  className="w-14 h-14 rounded-xl border border-slate-200 bg-white p-1 hover:border-emerald-600 transition-colors block cursor-pointer shrink-0 active:scale-95"
                  title="Lihat QR Code"
                  aria-label={`Lihat QR Code ${item.codeText}`}
                >
                  <img
                    src={item.qrImageUrl}
                    alt={`QR ${item.codeText}`}
                    className="w-full h-full object-contain"
                  />
                </button>
                <div>
                  <div className="font-bold text-slate-900 font-mono text-sm tracking-tight">
                    {item.codeText}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.createdAt}</span>
                  </div>
                </div>
              </div>

              <StatusBadge
                status={item.status}
                variant={item.status === 'Aktif' ? 'active' : 'standby'}
              />
            </div>

            {/* Middle row: Location and Hardware Node */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {isInstalled ? (
                  <span className="font-medium">
                    {item.blockName} {item.farmName ? `(${item.farmName})` : ''}
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Belum terpasang di blok</span>
                )}
              </div>

              {item.nodeSensorName && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Cpu className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-mono text-emerald-800 font-medium">
                    Node: {item.nodeSensorName}
                  </span>
                </div>
              )}
            </div>

            {/* Status Switch Controls */}
            <div className="flex items-center justify-between py-1 px-1">
              <span className="text-xs font-medium text-slate-600">
                Status Pengaktifan:
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={item.status === 'Aktif'}
                onClick={() => onToggleStatus(item.id)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 ${
                  item.status === 'Aktif' ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
                aria-label={`Ubah status ${item.codeText} menjadi ${item.status === 'Aktif' ? 'Nonaktif' : 'Aktif'}`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    item.status === 'Aktif' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Actions: Minimum 44px height buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onViewDetail(item)}
                className="min-h-[44px] px-3 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs active:scale-[0.98] transition-colors"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                <span>Detail & Cetak</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(item)}
                className="min-h-[44px] px-3 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs active:scale-[0.98] transition-colors"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        );
      }}
    />
  );
};
