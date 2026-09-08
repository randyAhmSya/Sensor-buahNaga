import React from 'react';
import { Sprout, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const UpcomingHarvestWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 md:p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg border border-emerald-200 bg-white text-emerald-700 flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Progres Panen Terdekat</h3>
            <p className="text-xs text-slate-500">Kebun Cempaka — Blok A</p>
          </div>
        </div>
        <Link
          to="/admin/harvests"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
        >
          <span>Detail</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="py-4 space-y-4 flex-1 flex flex-col justify-center">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-extrabold text-slate-900">14</span>
            <span className="text-xs font-semibold text-slate-500 ml-1.5">Hari Menuju Panen</span>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-white border border-emerald-600 px-2.5 py-0.5 rounded-full">
            Fase Pembesaran Buah
          </span>
        </div>

        {/* Progress Bar Bersih */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Progres Siklus (Hari ke-36 dari 50)</span>
            <span className="text-emerald-700 font-bold">72%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div className="h-full bg-emerald-600 rounded-full" style={{ width: '72%' }} />
          </div>
        </div>

        {/* Sub-Card Putih Outline */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Estimasi Tanggal</span>
            <span className="text-xs font-bold text-slate-900">24 Nov 2026</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Target Estimasi</span>
            <span className="text-xs font-bold text-emerald-700">~1,4 Ton Buah</span>
          </div>
        </div>
      </div>
    </div>
  );
};
