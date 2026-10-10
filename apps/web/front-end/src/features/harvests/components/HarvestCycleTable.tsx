import React from 'react';
import { Flower2, CheckCircle2, Trash2, Calendar } from 'lucide-react';
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
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">Nama Blok & Kebun</th>
              <th className="py-4 px-5">Tgl Penyinaran</th>
              <th className="py-4 px-5">Target & Bunga Aktual</th>
              <th className="py-4 px-5">Estimasi Panen</th>
              <th className="py-4 px-5">Panen Nyata</th>
              <th className="py-4 px-5">Status Siklus</th>
              <th className="py-4 px-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-sm text-slate-500 font-medium">
                  <div className="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
                  <span>Memuat data siklus panen riil...</span>
                </td>
              </tr>
            ) : cycles.length > 0 ? (
              cycles.map((item) => {
                const isRunning = item.status_siklus === 'BERJALAN';
                const hasFlowerDate = Boolean(item.tanggal_berbunga_aktual);
                const hasHarvestDate = Boolean(item.tanggal_panen);

                return (
                  <tr key={item.id_siklus_panen} className="hover:bg-slate-50/60 transition-colors">
                    {/* Blok & Kebun */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{item.blockName || 'Blok Lahan'}</div>
                      <div className="text-xs text-slate-500">{item.farmName || 'Kebun Buah Naga'}</div>
                    </td>

                    {/* Tanggal Penyinaran */}
                    <td className="py-4 px-5 font-medium text-slate-600 whitespace-nowrap">
                      {item.tanggal_penyinaran || '—'}
                    </td>

                    {/* Target & Bunga Aktual */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">
                        {item.target_hari_berbunga} Hari Target
                      </div>
                      <div className="text-xs mt-0.5">
                        {hasFlowerDate ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                            <Flower2 className="w-3 h-3" />
                            {item.tanggal_berbunga_aktual}
                          </span>
                        ) : (
                          <span className="text-slate-400">Belum mekar (—)</span>
                        )}
                      </div>
                    </td>

                    {/* Estimasi Panen */}
                    <td className="py-4 px-5 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{item.estimasi_tanggal_panen || '—'}</span>
                      </div>
                    </td>

                    {/* Panen Nyata */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      {hasHarvestDate ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {item.tanggal_panen}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">—</span>
                      )}
                    </td>

                    {/* Status Siklus */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      {isRunning ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-amber-400 bg-amber-50 text-amber-800 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                          BERJALAN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                          SELESAI
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Tombol Catat Bunga (Hanya jika status BERJALAN dan belum ada bunga aktual) */}
                        {isRunning && !hasFlowerDate && (
                          <button
                            type="button"
                            onClick={() => onRecordFlower(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                            title="Catat Kemunculan Bunga Aktual"
                          >
                            <Flower2 className="w-3.5 h-3.5" />
                            <span>Catat Bunga</span>
                          </button>
                        )}

                        {/* Tombol Catat Panen (Hanya jika status BERJALAN) */}
                        {isRunning && (
                          <button
                            type="button"
                            onClick={() => onRecordHarvest(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                            title="Catat Hasil Panen & Selesaikan Siklus"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Catat Panen</span>
                          </button>
                        )}

                        {/* Tombol Hapus */}
                        <button
                          type="button"
                          onClick={() => onDeleteCycle(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus Siklus Panen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12 text-sm text-slate-500 font-medium">
                  <div className="space-y-1">
                    <p className="text-slate-700 font-bold">Belum Ada Siklus Panen Terdaftar</p>
                    <p className="text-xs text-slate-400">
                      Klik tombol &ldquo;Mulai Siklus Baru&rdquo; untuk memulai pencatatan induksi lampu.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
