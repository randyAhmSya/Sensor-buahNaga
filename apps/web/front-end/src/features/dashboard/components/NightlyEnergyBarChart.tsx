import React, { useState } from 'react';
import { Zap } from 'lucide-react';

export interface NightlyEnergyPoint {
  tanggal: string;
  kwh: number;
  rawDate?: string;
}

export interface NightlyEnergyBarChartProps {
  data: NightlyEnergyPoint[];
  totalKwh?: number;
  isLoading?: boolean;
  className?: string;
}

export const NightlyEnergyBarChart: React.FC<NightlyEnergyBarChartProps> = ({
  data = [],
  totalKwh = 0,
  isLoading = false,
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const hasData = data.length > 0 && data.some((d) => d.kwh > 0);
  const maxKwh = hasData ? Math.max(...data.map((d) => d.kwh), 1) : 1;

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 md:p-6 flex flex-col justify-between h-full ${className}`}
    >
      {/* Header Kartu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Zap className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2} />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Konsumsi Energi Malam Hari</h2>
            <p className="text-xs text-slate-500">Akumulasi penggunaan daya lampu 7 malam terakhir</p>
          </div>
        </div>

        {hasData && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl text-xs font-bold text-emerald-800">
            <span>Total:</span>
            <span>{totalKwh.toFixed(2)} kWh</span>
          </div>
        )}
      </div>

      {/* Konten Grafik Bar atau Empty State */}
      <div className="pt-4 flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="h-44 flex flex-col items-center justify-center space-y-3 animate-pulse">
            <div className="h-4 bg-slate-100 rounded-md w-1/3" />
            <div className="h-28 bg-slate-100 rounded-xl w-full" />
          </div>
        ) : !hasData ? (
          <div className="w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center h-44 text-center space-y-2">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Zap className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              Belum ada data konsumsi energi malam ini
            </p>
            <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed">
              Data akumulasi kWh per malam akan muncul setelah sensor daya aktif mencatat siklus penyinaran.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <div className="w-full h-40 flex items-end justify-between gap-2 sm:gap-3 border-b border-slate-200 pb-2">
              {data.map((bar, index) => {
                const heightPercent = Math.max(Math.round((bar.kwh / maxKwh) * 100), 4);
                const isHovered = hoveredIndex === index;

                return (
                  <div
                    key={bar.tanggal + index}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Tooltip Nilai kWh di Atas Bar */}
                    <div
                      className={`absolute -top-7 z-10 bg-slate-900 text-white rounded px-1.5 py-0.5 text-[10px] font-bold shadow-md transition-opacity pointer-events-none ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {bar.kwh.toFixed(2)} kWh
                    </div>

                    {/* Batang Bar */}
                    <div className="w-full bg-slate-100 rounded-t-md overflow-hidden flex items-end h-full">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all duration-200 ${
                          isHovered ? 'bg-emerald-700' : 'bg-emerald-600'
                        }`}
                      />
                    </div>

                    {/* Label Tanggal */}
                    <span className="text-[10px] font-semibold text-slate-500 mt-2 truncate w-full text-center">
                      {bar.tanggal}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
