import React from 'react';
import { Cpu, Wifi, WifiOff } from 'lucide-react';
import type { SensorSummaryMetrics } from '@/types/sensor.types';

interface SensorSummaryCardsProps {
  metrics: SensorSummaryMetrics;
}

export const SensorSummaryCards: React.FC<SensorSummaryCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Total Node */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Node Sensor</span>
          <Cpu className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{metrics.totalNodes}</div>
        <p className="text-xs text-slate-500">Node terpasang di seluruh blok lahan</p>
      </div>

      {/* Node Online */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Node Online</span>
          <Wifi className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{metrics.onlineNodes}</div>
        <p className="text-xs text-slate-500">Beroperasi normal dan mengirim telemetri</p>
      </div>

      {/* Node Offline */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Node Offline / Masalah</span>
          <WifiOff className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{metrics.offlineNodes}</div>
        <p className="text-xs text-slate-500">
          {metrics.offlineNodes > 0 ? 'Perlu pengecekan baterai atau gateway' : 'Semua perangkat terkoneksi'}
        </p>
      </div>
    </div>
  );
};
