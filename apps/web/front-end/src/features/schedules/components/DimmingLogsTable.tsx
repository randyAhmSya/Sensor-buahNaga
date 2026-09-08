import React, { useState, useMemo } from 'react';
import { History, ChevronDown, Moon, Sun, Sunrise } from 'lucide-react';
import type { DimmingLogItem } from '@/data/mockSchedules';
import { getDimmingChartByNode } from '@/data/mockSchedules';
import { DimmingBarChart } from './DimmingBarChart';

interface DimmingLogsTableProps {
  logs: DimmingLogItem[];
}

export const DimmingLogsTable: React.FC<DimmingLogsTableProps> = ({ logs }) => {
  const [selectedNode, setSelectedNode] = useState<string>('ALL');

  // Filter log tabel berdasarkan node terpilih
  const filteredLogs = useMemo(() => {
    if (selectedNode === 'ALL') return logs;
    return logs.filter((item) => item.nodeCode === selectedNode);
  }, [logs, selectedNode]);

  // Ambil data bar chart yang sesuai dengan node terpilih
  const chartData = useMemo(() => {
    return getDimmingChartByNode(selectedNode);
  }, [selectedNode]);

  const renderMoonPhaseIcon = (phase: DimmingLogItem['moonPhase']) => {
    switch (phase) {
      case 'Full Moon':
      case 'Clear Night':
        return <Moon className="w-4 h-4 text-slate-500" />;
      case 'Dawn':
        return <Sunrise className="w-4 h-4 text-amber-500" />;
      case 'Sunrise':
        return <Sun className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-700 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900">
              Riwayat Log Peredupan (Auto-Dimming)
            </h3>
            <p className="text-xs text-slate-500">Penyesuaian intensitas otomatis sesuai cahaya alami sekitar</p>
          </div>
        </div>

        {/* Dropdown Filter Interaktif */}
        <div className="relative">
          <select
            value={selectedNode}
            onChange={(e) => setSelectedNode(e.target.value)}
            className="appearance-none pl-3.5 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
          >
            <option value="ALL">Semua Node (ND-001, ND-002, ND-003)</option>
            <option value="ND-001">ND-001 (Kebun A - Blok 1)</option>
            <option value="ND-002">ND-002 (Kebun A - Blok 2)</option>
            <option value="ND-003">ND-003 (Kebun B - Blok 1)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Visualisasi Grafik Batang yang berubah sesuai filter */}
      <DimmingBarChart data={chartData} />

      {/* Tabel Log yang tersaring */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Kode Node</th>
              <th className="py-3 px-4">Waktu</th>
              <th className="py-3 px-4 text-right">Persentase Redup</th>
              <th className="py-3 px-4 text-right">Nilai Lux Terbaca</th>
              <th className="py-3 px-4">Fase Lingkungan</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{log.nodeCode}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">{log.time}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-700">{log.dimmingPercentage}%</td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900">
                    {log.luxValue.toLocaleString('id-ID')} lx
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      {renderMoonPhaseIcon(log.moonPhase)}
                      <span>{log.moonPhase}</span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-xs text-slate-400 font-medium">
                  Tidak ada data log peredupan untuk node ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
