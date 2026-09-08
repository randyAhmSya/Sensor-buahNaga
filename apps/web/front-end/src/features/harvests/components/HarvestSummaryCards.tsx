import React from 'react';
import { Sprout, Calendar, Scale } from 'lucide-react';
import type { HarvestMetrics } from '@/data/mockHarvests';

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
          <h3 className="text-3xl font-bold text-slate-900 mt-1">{metrics.activeCycles}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl border border-emerald-200 bg-white text-emerald-700 flex items-center justify-center shrink-0">
          <Sprout className="w-6 h-6" />
        </div>
      </div>

      {/* Estimasi Panen Terdekat */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-2xs">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Estimasi Panen Terdekat
          </p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1.5">{metrics.nearestHarvestDate}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center justify-center shrink-0">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      {/* Total Panen Bulan Ini */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-2xs">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Panen Bulan Ini
          </p>
          <h3 className="text-3xl font-bold text-emerald-700 mt-1">
            {metrics.totalHarvestThisMonthTon}{' '}
            <span className="text-base font-medium text-slate-500">Ton</span>
          </h3>
        </div>
        <div className="w-12 h-12 rounded-xl border border-emerald-200 bg-white text-emerald-700 flex items-center justify-center shrink-0">
          <Scale className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
