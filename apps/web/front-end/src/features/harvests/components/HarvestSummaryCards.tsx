import React from 'react';
import { Sprout, Calendar, CheckCircle2 } from 'lucide-react';
import type { HarvestMetrics } from '../types/harvest.types';

interface HarvestSummaryCardsProps {
  metrics: HarvestMetrics;
}

export const HarvestSummaryCards: React.FC<HarvestSummaryCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Siklus Berjalan */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-2xs">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Siklus Panen Berjalan
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-bold text-slate-900">{metrics.activeCycles}</h3>
            <span className="text-xs font-semibold text-slate-500">Blok Aktif</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl border border-amber-200 bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Sprout className="w-6 h-6" />
        </div>
      </div>

      {/* Estimasi Panen Terdekat */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-2xs">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Estimasi Panen Terdekat
          </p>
          <h3 className="text-2xl font-bold text-emerald-700 mt-1.5">
            {metrics.nearestHarvestDate || 'Belum Ada Siklus'}
          </h3>
        </div>
        <div className="w-12 h-12 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      {/* Total Siklus Selesai */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-2xs">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Siklus Selesai
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-bold text-slate-900">{metrics.completedCycles}</h3>
            <span className="text-xs font-semibold text-slate-500">Terselesaikan</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
