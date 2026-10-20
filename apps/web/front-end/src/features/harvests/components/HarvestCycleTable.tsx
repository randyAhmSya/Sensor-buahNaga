import React from 'react';
import { Flower2, CheckCircle2, Trash2, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { ResponsiveDataTable, type ColumnDef } from '@/components/ui/ResponsiveDataTable';
import type { HarvestCycle } from '../types/harvest.types';

interface HarvestCycleTableProps {
  cycles: HarvestCycle[];
  onRecordFlower: (cycle: HarvestCycle) => void;
  onRecordHarvest: (cycle: HarvestCycle) => void;
  onDeleteCycle: (cycle: HarvestCycle) => void;
  isLoading?: boolean;
}

export const HarvestCycleTable: React.FC<HarvestCycleTableProps> = ({
  cycles,
  onRecordFlower,
  onRecordHarvest,
  onDeleteCycle,
  isLoading = false,
}) => {
  // Definisi Kolom Desktop
  const columns: ColumnDef<HarvestCycle>[] = [
    {
      header: 'Nama Blok & Kebun',
      cell: (item) => (
        <div>
          <div className="font-bold text-slate-900">{item.blockName || 'Blok Lahan'}</div>
          <div className="text-xs text-slate-500">{item.farmName || 'Kebun Buah Naga'}</div>
        </div>
      ),
    },
    {
      header: 'Tgl Penyinaran',
      cell: (item) => (
        <span className="font-medium text-slate-700 whitespace-nowrap">
          {item.tanggal_penyinaran ? formatDate(item.tanggal_penyinaran) : '-'}
        </span>
      ),
    },
    {
      header: 'Target & Bunga Aktual',
      cell: (item) => {
        const hasFlowerDate = Boolean(item.tanggal_berbunga_aktual);
        return (
          <div className="whitespace-nowrap">
            <div className="font-semibold text-slate-800">
              {item.target_hari_berbunga} Hari Target
            </div>
            <div className="text-xs mt-1">
              {hasFlowerDate ? (
                <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/90 shadow-2xs">
                  <Flower2 className="w-3 h-3 text-emerald-700 shrink-0" />
                  {formatDate(item.tanggal_berbunga_aktual!)}
                </span>
              ) : (
                <span className="text-slate-400">Belum mekar (-)</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Estimasi Panen',
      cell: (item) => (
        <div className="flex items-center gap-1.5 font-bold text-slate-900 whitespace-nowrap">
          <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{item.estimasi_tanggal_panen ? formatDate(item.estimasi_tanggal_panen) : '-'}</span>
        </div>
      ),
    },
    {
      header: 'Panen Nyata',
      cell: (item) => (
        <div className="whitespace-nowrap">
          {item.tanggal_panen ? (
            <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              {formatDate(item.tanggal_panen)}
            </span>
          ) : (
            <span className="text-slate-400 font-medium">-</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status Siklus',
      cell: (item) => {
        const isRunning = item.status_siklus === 'BERJALAN';
        return isRunning ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-slate-300 bg-slate-100 text-slate-800 shadow-2xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse shrink-0" />
            BERJALAN
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-900 shadow-2xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
            SELESAI
          </span>
        );
      },
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (item) => {
        const isRunning = item.status_siklus === 'BERJALAN';
        const hasFlowerDate = Boolean(item.tanggal_berbunga_aktual);
        return (
          <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
            {isRunning && !hasFlowerDate && (
              <button
                type="button"
                onClick={() => onRecordFlower(item)}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer active:scale-95 shadow-2xs"
                title="Catat Kemunculan Bunga Aktual"
              >
                <Flower2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Catat Bunga</span>
              </button>
            )}

            {isRunning && (
              <button
                type="button"
                onClick={() => onRecordHarvest(item)}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors cursor-pointer active:scale-95 shadow-2xs"
                title="Catat Hasil Panen & Selesaikan Siklus"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Catat Panen</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onDeleteCycle(item)}
              className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer active:scale-95"
              title="Hapus Siklus Panen"
              aria-label="Hapus siklus panen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  // Render Kartu Khusus untuk Layar Ponsel (< 768px)
  const renderMobileCard = (item: HarvestCycle) => {
    const isRunning = item.status_siklus === 'BERJALAN';
    const hasFlowerDate = Boolean(item.tanggal_berbunga_aktual);
    const hasHarvestDate = Boolean(item.tanggal_panen);

    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Header Kartu: Blok, Kebun, dan Status */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-bold text-slate-900 truncate">
              {item.blockName || 'Blok Lahan'}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {item.farmName || 'Kebun Buah Naga'}
            </p>
          </div>

          <div className="shrink-0">
            {isRunning ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border border-slate-300 bg-slate-100 text-slate-800 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse shrink-0" />
                BERJALAN
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border border-emerald-300 bg-emerald-50 text-emerald-900 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                SELESAI
              </span>
            )}
          </div>
        </div>

        {/* Grid Data Siklus */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Tgl Penyinaran</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {item.tanggal_penyinaran ? formatDate(item.tanggal_penyinaran) : '-'}
            </span>
          </div>

          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Target Bunga</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {item.target_hari_berbunga} Hari
            </span>
          </div>

          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Bunga Aktual</span>
            <span className="font-semibold text-slate-800 mt-0.5 block">
              {hasFlowerDate ? (
                <span className="text-emerald-800 font-bold inline-flex items-center gap-1">
                  <Flower2 className="w-3 h-3 text-emerald-700" />
                  {formatDate(item.tanggal_berbunga_aktual!)}
                </span>
              ) : (
                <span className="text-slate-400">Belum mekar (-)</span>
              )}
            </span>
          </div>

          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Estimasi Panen</span>
            <span className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-700 shrink-0" />
              {item.estimasi_tanggal_panen ? formatDate(item.estimasi_tanggal_panen) : '-'}
            </span>
          </div>

          {hasHarvestDate && (
            <div className="col-span-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/80">
              <span className="text-emerald-700 block text-[11px] font-semibold">Panen Nyata Berhasil</span>
              <span className="font-bold text-emerald-900 mt-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                {formatDate(item.tanggal_panen!)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons Footer (Touch Target >= 44px) */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          {isRunning && !hasFlowerDate && (
            <button
              type="button"
              onClick={() => onRecordFlower(item)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 shadow-2xs transition-colors active:scale-98 cursor-pointer"
            >
              <Flower2 className="w-4 h-4 text-slate-600" />
              <span>Catat Bunga</span>
            </button>
          )}

          {isRunning && (
            <button
              type="button"
              onClick={() => onRecordHarvest(item)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 shadow-2xs transition-colors active:scale-98 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Catat Panen</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onDeleteCycle(item)}
            className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer active:scale-95 shrink-0"
            aria-label="Hapus siklus panen"
            title="Hapus Siklus"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveDataTable<HarvestCycle>
      columns={columns}
      data={cycles}
      keyExtractor={(item) => item.id_siklus_panen}
      isLoading={isLoading}
      emptyMessage="Belum Ada Siklus Panen Terdaftar"
      emptySubMessage="Mulai catat induksi pencahayaan lampu untuk memantau siklus pertumbuhan dan proyeksi panen buah naga."
      renderMobileCard={renderMobileCard}
      tableMinWidth="min-w-[850px]"
    />
  );
};
