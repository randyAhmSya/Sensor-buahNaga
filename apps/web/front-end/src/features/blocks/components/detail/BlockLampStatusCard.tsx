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
            <Lightbulb className="w-4 h-4 text-slate-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700 tracking-wide">Status Lampu Blok</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border border-slate-200 bg-slate-50 text-slate-600">
            Tidak Ada Node
          </span>
        </div>
        <p className="text-xs text-slate-500 py-2">
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
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-slate-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700 tracking-wide">Status Lampu Blok</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Batas Offline: {batas_offline_detik}s
          </span>
        </div>

        {/* Ringkasan Jumlah */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center space-y-1">
            <p className="text-[11px] font-semibold text-slate-500">Total Lampu</p>
            <p className="text-xl font-bold text-slate-900">{jumlah_lampu}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center space-y-1">
            <p className="text-[11px] font-semibold text-slate-700 flex items-center justify-center gap-1">
              <Wifi className="w-3 h-3 text-slate-600" />
              Online
            </p>
            <p className="text-xl font-bold text-slate-900">{jumlah_online}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-center space-y-1">
            <p className="text-[11px] font-semibold text-slate-600 flex items-center justify-center gap-1">
              <WifiOff className="w-3 h-3 text-slate-500" />
              Offline
            </p>
            <p className="text-xl font-bold text-slate-700">{jumlah_offline}</p>
          </div>
        </div>

        {/* Daftar Node Lampu */}
        {nodes && nodes.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Node Lampu Terpasang
            </p>
            <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 text-xs">
              {nodes.map((node) => {
                const isNodeOnline = node.status_online;
                const lastSeenText = node.terakhir_terlihat
                  ? new Date(node.terakhir_terlihat).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Belum terdeteksi';

                return (
                  <div key={node.id_sensor} className="py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isNodeOnline ? 'bg-emerald-600' : 'bg-slate-400'
                        }`}
                      />
                      <span className="font-mono font-bold text-slate-900">
                        {node.kode_perangkat}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {lastSeenText}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold ${
                          isNodeOnline
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {isNodeOnline ? 'Online' : 'Offline'}
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
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Status sinkronisasi BlokStatusService
        </span>
        <span className="font-semibold text-slate-700">Otomatis 90s</span>
      </div>
    </div>
  );
};
