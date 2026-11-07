import React, { useState } from 'react';
import { Sliders, Moon } from 'lucide-react';

export interface DimmingLogPoint {
  jam: string;
  kecerahan: number; // 0 - 100 (%)
  lux: number; // nilai lux aktual
}

export interface BlockNodeOption {
  id: string;
  name: string;
  isManual?: boolean;
  manualBrightness?: number;
}

export interface IntensityDimmingLineChartProps {
  options: BlockNodeOption[];
  selectedId: string;
  onSelectId: (id: string) => void;
  data: DimmingLogPoint[];
  isManualMode?: boolean;
  manualBrightnessPercent?: number;
  isLoading?: boolean;
  className?: string;
}

export const IntensityDimmingLineChart: React.FC<IntensityDimmingLineChartProps> = ({
  options = [],
  selectedId,
  onSelectId,
  data = [],
  isManualMode = false,
  manualBrightnessPercent = 100,
  isLoading = false,
  className = '',
}) => {
  const [activeHoverIndex, setActiveHoverIndex] = useState<number | null>(null);

  const hasData = data.length > 0;

  // Nilai maksimum untuk skala Lux
  const maxLux = hasData
    ? Math.max(...data.map((d) => d.lux), 100)
    : 100;

  // Dimensi SVG
  const svgWidth = 600;
  const svgHeight = 220;
  const padding = { top: 20, right: 45, bottom: 35, left: 45 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Menghitung koordinat titik garis
  const points = data.map((item, index) => {
    const x = padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth;
    // Sumbu kiri: Kecerahan 0 - 100%
    const yBrightness = padding.top + chartHeight - (Math.min(Math.max(item.kecerahan, 0), 100) / 100) * chartHeight;
    // Sumbu kanan: Lux 0 - maxLux
    const yLux = padding.top + chartHeight - (Math.min(Math.max(item.lux, 0), maxLux) / maxLux) * chartHeight;

    return { ...item, x, yBrightness, yLux };
  });

  const brightnessPath = points.length > 0
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yBrightness.toFixed(1)}`).join(' ')
    : '';

  const luxPath = points.length > 0
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.yLux.toFixed(1)}`).join(' ')
    : '';

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 md:p-6 flex flex-col justify-between h-full ${className}`}>
      {/* Header dengan Dropdown Pilihan Blok/Node */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm md:text-base font-bold text-slate-900 tracking-tight">
            Siklus Intensitas Lampu & Auto-Dimming
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kecerahan lampu (%) dan lux sekitar malam ini
          </p>
        </div>

        <div className="flex items-center gap-2">
          {options.length > 0 && (
            <select
              value={selectedId}
              onChange={(e) => onSelectId(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer shadow-2xs"
            >
              {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Mode Manual Indicator */}
      {isManualMode && (
        <div className="mt-3 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900 font-semibold shadow-2xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mode Manual Aktif</span>
          </div>
          <span className="font-bold text-amber-700">
            Kecerahan tetap {manualBrightnessPercent}%
          </span>
        </div>
      )}

      {/* Isi Chart atau Empty State */}
      <div className="pt-4 flex-1 flex flex-col justify-center">
        {isLoading ? (
          <div className="h-52 flex flex-col items-center justify-center space-y-3 animate-pulse">
            <div className="h-4 bg-slate-100 rounded-md w-1/2" />
            <div className="h-28 bg-slate-100 rounded-xl w-full" />
          </div>
        ) : !hasData ? (
          <div className="w-full bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center h-52 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Moon className="w-5 h-5 text-slate-500" />
            </div>
            <p className="text-sm font-bold text-slate-700">Belum ada data malam ini</p>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Log siklus peredupan dan pembacaan sensor lux akan tercatat otomatis saat penyinaran malam hari dimulai.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Legend Sumbu */}
            <div className="flex items-center justify-end gap-5 text-xs font-semibold text-slate-600 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full bg-emerald-600 inline-block" />
                <span>Kecerahan Lampu (%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full bg-amber-500 inline-block" />
                <span>Lux Sekitar (lx)</span>
              </div>
            </div>

            {/* SVG Line Chart Dinamis */}
            <div className="relative w-full overflow-hidden">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-48 select-none"
              >
                {/* Garis Grid Horizontal */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = padding.top + chartHeight * ratio;
                  const percentLabel = Math.round((1 - ratio) * 100);
                  const luxLabel = Math.round((1 - ratio) * maxLux);
                  return (
                    <g key={ratio}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={svgWidth - padding.right}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      {/* Label Y Kiri (% Kecerahan) */}
                      <text
                        x={padding.left - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[10px] fill-slate-400 font-medium"
                      >
                        {percentLabel}%
                      </text>
                      {/* Label Y Kanan (Lux) */}
                      <text
                        x={svgWidth - padding.right + 8}
                        y={y + 4}
                        textAnchor="start"
                        className="text-[10px] fill-slate-400 font-medium"
                      >
                        {luxLabel}
                      </text>
                    </g>
                  );
                })}

                {/* Garis Kecerahan Lampu (%) */}
                <path
                  d={brightnessPath}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Garis Lux Sekitar */}
                <path
                  d={luxPath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Titik Point Kecerahan */}
                {points.map((p, idx) => (
                  <circle
                    key={`b-${idx}`}
                    cx={p.x}
                    cy={p.yBrightness}
                    r={activeHoverIndex === idx ? 5 : 3.5}
                    fill="#059669"
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setActiveHoverIndex(idx)}
                    onMouseLeave={() => setActiveHoverIndex(null)}
                  />
                ))}

                {/* Titik Point Lux */}
                {points.map((p, idx) => (
                  <circle
                    key={`l-${idx}`}
                    cx={p.x}
                    cy={p.yLux}
                    r={activeHoverIndex === idx ? 5 : 3.5}
                    fill="#f59e0b"
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setActiveHoverIndex(idx)}
                    onMouseLeave={() => setActiveHoverIndex(null)}
                  />
                ))}

                {/* Label Sumbu X (Jam) */}
                {points.map((p, idx) => (
                  <text
                    key={`t-${idx}`}
                    x={p.x}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-500 font-semibold"
                  >
                    {p.jam}
                  </text>
                ))}
              </svg>

              {/* Tooltip Hover Titik */}
              {activeHoverIndex !== null && points[activeHoverIndex] && (
                <div
                  className="absolute bg-slate-900 text-white rounded-lg px-2.5 py-1.5 text-xs shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-full z-10 space-y-0.5"
                  style={{
                    left: `${(points[activeHoverIndex].x / svgWidth) * 100}%`,
                    top: `${(points[activeHoverIndex].yBrightness / svgHeight) * 100}%`,
                  }}
                >
                  <p className="font-bold text-slate-200">
                    Pukul {points[activeHoverIndex].jam}
                  </p>
                  <p className="text-emerald-400 font-semibold">
                    Kecerahan: {points[activeHoverIndex].kecerahan}%
                  </p>
                  <p className="text-amber-400 font-semibold">
                    Lux: {points[activeHoverIndex].lux} lx
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
