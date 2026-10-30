import React from 'react';
import { Lightbulb, Wifi, WifiOff, Clock, ShieldCheck } from 'lucide-react';
import type { BlokStatusLampuResponse } from '@/types/block.types';

interface BlockLampStatusCardProps {
  statusLampu: BlokStatusLampuResponse | null;
  isLoading?: boolean;
}

export const BlockLampStatusCard: React.FC<BlockLampStatusCardProps> = ({
  statusLampu,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4 animate-pulse">
        <div className="h-4 bg-slate-200 rounded-md w-1/3" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 bg-slate-100 rounded-xl" />
          <div className="h-16 bg-slate-100 rounded-xl" />
          <div className="h-16 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!statusLampu) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-slate-700 shrink-0" />
            <span className="text-xs font-bold text-slate-800 tracking-wide">Status Lampu Blok</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold border-2 border-slate-300 bg-white text-slate-700">
            Tidak Ada Node
          </span>
        </div>
        <p className="text-xs text-slate-600 py-2">
          Belum ada node sensor lampu terpasang pada blok lahan ini.
        </p>
      </div>
    );
  }

  const { jumlah_lampu, jumlah_online, jumlah_offline, batas_offline_detik, nodes } = statusLampu;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col justify-between space-y-5">
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-slate-700 shrink-0" />
            <span className="text-xs font-bold text-slate-800 tracking-wide">Status Lampu Blok</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border-2 border-slate-200 bg-white text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Batas: {batas_offline_detik}s
          </span>
        </div>

        {/* Ringkasan Jumlah dengan Kartu Solid */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          <div className="bg-white rounded-xl p-3 border-2 border-slate-200 text-center space-y-1">
            <p className="text-[11px] font-bold text-slate-600">Total Lampu</p>
            <p className="text-xl font-black text-slate-900">{jumlah_lampu}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border-2 border-emerald-600 text-center space-y-1">
            <p className="text-[11px] font-bold text-emerald-800 flex items-center justify-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-emerald-700" />
              Online
            </p>
            <p className="text-xl font-black text-emerald-800">{jumlah_online}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border-2 border-slate-200 text-center space-y-1">
            <p className="text-[11px] font-bold text-slate-600 flex items-center justify-center gap-1">
              <WifiOff className="w-3.5 h-3.5 text-slate-500" />
              Offline
            </p>
            <p className="text-xl font-black text-slate-700">{jumlah_offline}</p>
          </div>
        </div>

        {/* Daftar Node Lampu */}
        {nodes && nodes.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              Node Lampu Terpasang
            </p>
            <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 text-xs">
              {nodes.map((node) => {
                const normalizedNodeStatus = (node.status || (node.status_online ? 'online' : 'offline')).toLowerCase();
                const isNodeOnline = normalizedNodeStatus === 'online';
                const isNodeOffline = normalizedNodeStatus === 'offline';

                let nodeStatusLabel = 'Belum pernah terhubung';
                let nodeBadgeClasses = 'bg-white text-slate-700 border-slate-300';
                let nodeDotClass = 'bg-slate-400';

                if (isNodeOnline) {
                  nodeStatusLabel = 'Online';
                  nodeBadgeClasses = 'bg-white text-emerald-800 border-emerald-600';
                  nodeDotClass = 'bg-emerald-600';
                } else if (isNodeOffline) {
                  nodeStatusLabel = 'Offline';
                  nodeBadgeClasses = 'bg-white text-rose-800 border-rose-500';
                  nodeDotClass = 'bg-rose-500';
                }

                const lastSeenText = node.terakhir_terlihat && node.terakhir_terlihat.trim()
                  ? node.terakhir_terlihat
                  : 'Belum ada data';

                return (
                  <div key={node.id_sensor} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${nodeDotClass}`} />
                      <span className="font-mono font-bold text-slate-900">
                        {node.kode_perangkat}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-[11px]">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {lastSeenText}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md font-bold border-2 ${nodeBadgeClasses}`}>
                        {nodeStatusLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 font-medium text-slate-600">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Status sinkronisasi BlokStatusService
        </span>
        <span className="font-bold text-slate-700">Otomatis {batas_offline_detik}s</span>
      </div>
    </div>
  );
};
