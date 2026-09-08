import React from 'react';
import type { DimmingBarItem } from '@/data/mockSchedules';

interface DimmingBarChartProps {
  data: DimmingBarItem[];
}

export const DimmingBarChart: React.FC<DimmingBarChartProps> = ({ data }) => {
  return (
    <div className="w-full bg-slate-50/60 border border-slate-200 rounded-xl p-4 sm:p-5">
      <div className="w-full h-44 flex items-end justify-between gap-1.5 sm:gap-2.5 border-b border-slate-200 pb-2.5">
        {data.map((bar) => (
          <div
            key={bar.hour}
            className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
          >
            {/* Label Persentase di Hover/Aktif */}
            <span className="text-[10px] sm:text-xs font-bold text-emerald-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {bar.percentage}%
            </span>

            {/* Batang Relatif Padat */}
            <div className="w-full bg-slate-200/70 rounded-t-md overflow-hidden flex items-end h-full">
              <div
                style={{ height: `${bar.percentage}%` }}
                className="w-full bg-emerald-600 rounded-t-md group-hover:bg-emerald-700 transition-all duration-200"
              />
            </div>

            {/* Label Jam */}
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-2">
              {bar.hour}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
