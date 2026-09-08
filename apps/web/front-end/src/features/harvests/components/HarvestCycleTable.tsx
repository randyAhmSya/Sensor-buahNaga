import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { HarvestCycleItem } from '@/data/mockHarvests';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface HarvestCycleTableProps {
  cycles: HarvestCycleItem[];
  onEditActual: (cycle: HarvestCycleItem) => void;
  onDeleteCycle: (cycleId: string) => void;
}

export const HarvestCycleTable: React.FC<HarvestCycleTableProps> = ({
  cycles,
  onEditActual,
  onDeleteCycle,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-4 px-6">Nama Blok (Kebun)</th>
              <th className="py-4 px-6">Tanggal Penyinaran</th>
              <th className="py-4 px-6">Target Hari</th>
              <th className="py-4 px-6">Estimasi Panen</th>
              <th className="py-4 px-6">Panen Aktual</th>
              <th className="py-4 px-6">Status Siklus</th>
              <th className="py-4 px-6 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {cycles.length > 0 ? (
              cycles.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900">{item.blockName}</div>
                    <div className="text-xs text-slate-500">{item.farmName}</div>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-600">{item.lightingDate}</td>
                  <td className="py-4 px-6 font-semibold text-slate-700">{item.bloomingTargetDays} Hari</td>
                  <td className="py-4 px-6 font-bold text-slate-900">{item.estimatedHarvestDate}</td>
                  <td className="py-4 px-6 font-medium">
                    {item.actualHarvestDate ? (
                      <span className="text-emerald-700 font-bold">{item.actualHarvestDate}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge
                      status={item.status}
                      variant={item.status === 'Berjalan' ? 'warning' : 'optimal'}
                    />
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEditActual(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Catat / Edit Panen Aktual"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCycle(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Siklus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12 text-sm text-slate-500 font-medium">
                  Tidak ada data siklus panen.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
