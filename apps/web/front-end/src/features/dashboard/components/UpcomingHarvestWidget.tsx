import React, { useState, useEffect, useMemo } from 'react';
import { Trees, ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { harvestService } from '@/services/harvestService';
import type { HarvestCycle } from '@/features/harvests/types/harvest.types';

interface UpcomingHarvestWidgetProps {
  initialCycles?: HarvestCycle[];
}

export const UpcomingHarvestWidget: React.FC<UpcomingHarvestWidgetProps> = ({ initialCycles }) => {
  const [cycles, setCycles] = useState<HarvestCycle[]>(initialCycles || []);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCycles);

  useEffect(() => {
    if (initialCycles && initialCycles.length > 0) {
      setCycles(initialCycles);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    harvestService
      .getAllCycles()
      .then((data) => {
        if (isMounted) {
          setCycles(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCycles([]);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialCycles]);

  // Cari siklus aktif (BERJALAN) dengan estimasi panen terdekat
  const activeCycle = useMemo(() => {
    const running = cycles.filter((c) => c.status_siklus === 'BERJALAN');
    if (running.length === 0) return null;

    return running.sort((a, b) => {
      const timeA = new Date(a.estimasi_tanggal_panen).getTime() || Infinity;
      const timeB = new Date(b.estimasi_tanggal_panen).getTime() || Infinity;
      return timeA - timeB;
    })[0];
  }, [cycles]);

  // Kalkulasi sisa hari dan progres persentase
  const { daysRemaining, progressPercent } = useMemo(() => {
    if (!activeCycle) return { daysRemaining: 0, progressPercent: 0 };

    const start = new Date(activeCycle.tanggal_penyinaran).getTime();
    const end = new Date(activeCycle.estimasi_tanggal_panen).getTime();
    const now = Date.now();

    let days = 0;
    if (end && !isNaN(end)) {
      days = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    }

    let pct = 0;
    if (start && end && end > start) {
      const totalDuration = end - start;
      const elapsed = Math.max(0, now - start);
      pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
    }

    return { daysRemaining: days, progressPercent: pct };
  }, [activeCycle]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 md:p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Trees className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Progres Panen Terdekat</h3>
            <p className="text-xs text-slate-500">
              {activeCycle
                ? `${activeCycle.farmName} - ${activeCycle.blockName}`
                : 'Belum ada siklus aktif'}
            </p>
          </div>
        </div>
        <Link
          to="/kebun/harvests"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
        >
          <span>Detail</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Memuat siklus panen aktif...</p>
        </div>
      ) : !activeCycle ? (
        <div className="py-8 space-y-2 flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-sm font-bold text-slate-700">Belum Ada Siklus Panen Berjalan</p>
          <p className="text-xs text-slate-400 max-w-[240px]">
            Mulai siklus induksi pencahayaan baru di modul Estimasi Panen.
          </p>
          <Link
            to="/kebun/harvests"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline mt-1"
          >
            Mulai Siklus Panen
          </Link>
        </div>
      ) : (
        <div className="py-4 space-y-4 flex-1 flex flex-col justify-center">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-extrabold text-slate-900">{daysRemaining}</span>
              <span className="text-xs font-semibold text-slate-500 ml-1.5">Hari Menuju Panen</span>
            </div>
            <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full">
              {activeCycle.tanggal_berbunga_aktual ? 'Fase Pematangan Buah' : 'Fase Induksi Bunga'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Estimasi Tanggal Panen:
              </span>
              <span className="text-emerald-700 font-bold">{activeCycle.estimasi_tanggal_panen}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Mulai Penyinaran</span>
              <span className="text-xs font-bold text-slate-900">{activeCycle.tanggal_penyinaran}</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Target Bunga</span>
              <span className="text-xs font-bold text-emerald-700">~{activeCycle.target_hari_berbunga} Hari</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
