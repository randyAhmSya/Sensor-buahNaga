import React from 'react';
import {
  History,
  ChevronDown,
  Sun,
  Cpu,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  useSchedulesQuery,
  useScheduleSummaryQuery,
} from '@/hooks/queries/useSchedulesQuery';
import { formatIndoDate } from '@/utils/formatters';
import type { JadwalLampuBackend } from '@/services/scheduleService';

export interface ScheduleHistoryTabProps {
  kebunId: string;
  kebunName: string;
  selectedScope: string; // 'default' atau id_sensor
  onScopeChange: (scope: string) => void;
}

export const ScheduleHistoryTab: React.FC<ScheduleHistoryTabProps> = ({
  kebunId,
  kebunName,
  selectedScope,
  onScopeChange,
}) => {
  // Ambil data node dari ringkasan kebun untuk mengisi dropdown
  const { data: summaryResponse } = useScheduleSummaryQuery(kebunId);
  const rawNodes = summaryResponse?.data?.node || [];
  const nodesWithSensor = rawNodes.filter((n) => Boolean(n.id_sensor));

  // Tentukan parameter query berdasarkan cakupan terpilih
  const queryParams =
    selectedScope === 'default'
      ? { kebun_id: kebunId }
      : { sensor_id: selectedScope };

  const {
    data: schedules = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSchedulesQuery(queryParams);

  // Label nama cakupan yang sedang dilihat
  const activeScopeLabel = React.useMemo(() => {
    if (selectedScope === 'default') {
      return `Default Kebun (${kebunName})`;
    }
    const found = nodesWithSensor.find((n) => n.id_sensor === selectedScope);
    if (found) {
      return `${found.nama_blok} - ${found.kode_perangkat || 'Node'}`;
    }
    return 'Node Terpilih';
  }, [selectedScope, kebunName, nodesWithSensor]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="h-6 bg-slate-200 rounded-md w-1/3" />
          <div className="h-9 bg-slate-100 rounded-xl w-48" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-slate-50 rounded-xl w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-3">
        <div className="flex items-center gap-3 text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <h3 className="font-bold text-sm md:text-base">Gagal memuat riwayat jadwal lampu</h3>
        </div>
        <p className="text-xs md:text-sm text-slate-600">
          {error?.pesan || error?.message || 'Terjadi gangguan saat mengambil data riwayat jadwal.'}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Coba Lagi</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 md:p-6 space-y-6">
      {/* ============================================================== */}
      {/* HEADER & DROPDOWN PEMILIH CAKUPAN */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-900">
              Riwayat Jadwal Lampu
            </h2>
            <p className="text-xs text-slate-500">
              Daftar kronologis konfigurasi jadwal yang pernah diterapkan untuk {activeScopeLabel}.
            </p>
          </div>
        </div>

        {/* Dropdown Pemilih Cakupan (Default Kebun vs Node Tertentu) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="history-scope-select" className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Cakupan:
          </label>
          <div className="relative min-w-[220px]">
            <select
              id="history-scope-select"
              value={selectedScope}
              onChange={(e) => onScopeChange(e.target.value)}
              className="w-full appearance-none pl-3.5 pr-9 py-2 bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-600 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer shadow-2xs"
            >
              <option value="default">Default Kebun ({kebunName})</option>
              {nodesWithSensor.map((node) => (
                <option key={node.id_sensor} value={node.id_sensor!}>
                  {node.nama_blok} - {node.kode_perangkat || 'Node'}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TABEL HANYA-BACA (READ-ONLY) */}
      {/* ============================================================== */}
      {schedules.length > 0 ? (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Dibuat</th>
                  <th className="py-3 px-4">Jam Nyala</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {schedules.map((item: JadwalLampuBackend) => {
                  const scheduleId = item.id_jadwal_lampu || item.id_jadwal || item.id || '';
                  const isActive = Boolean(item.status_aktif);
                  const startTime = (item.jam_mulai_nyala || item.jam_mulai || '-').substring(0, 5);
                  const endTime = (item.jam_akhir_nyala || item.jam_selesai || '-').substring(0, 5);
                  const isAuto = item.mode === 'auto';
                  const intensityVal = item.instensitas_cahaya ?? item.intensitas_cahaya ?? 80;

                  return (
                    <tr key={scheduleId} className="hover:bg-slate-50/50 transition-colors">
                      {/* Kolom Dibuat */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatIndoDate(item.created_at)}</span>
                        </div>
                      </td>

                      {/* Kolom Jam Nyala */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-xs tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{startTime}</span>
                          <span className="text-slate-400 font-normal">s/d</span>
                          <span>{endTime}</span>
                        </div>
                      </td>

                      {/* Kolom Mode */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col items-start gap-0.5">
                          {isAuto ? (
                            <>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border-2 border-emerald-700 bg-white text-emerald-800 shadow-2xs">
                                <Cpu className="w-3.5 h-3.5 text-emerald-700" />
                                Auto-dimming
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium tabular-nums">
                                Target: {item.target_lux ?? 0} Lux
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border-2 border-slate-600 bg-white text-slate-800 shadow-2xs">
                                <Sun className="w-3.5 h-3.5 text-slate-700" />
                                Manual
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium tabular-nums">
                                Kecerahan: {intensityVal}%
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Kolom Status & Indikator Sedang Berlaku */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isActive ? (
                            <>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Aktif
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/70 text-emerald-900 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Sedang berlaku
                              </span>
                            </>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                              Nonaktif
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Kolom Keterangan */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                        {item.keterangan || item.nama_jadwal || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {schedules.map((item: JadwalLampuBackend) => {
              const scheduleId = item.id_jadwal_lampu || item.id_jadwal || item.id || '';
              const isActive = Boolean(item.status_aktif);
              const startTime = (item.jam_mulai_nyala || item.jam_mulai || '-').substring(0, 5);
              const endTime = (item.jam_akhir_nyala || item.jam_selesai || '-').substring(0, 5);
              const isAuto = item.mode === 'auto';
              const intensityVal = item.instensitas_cahaya ?? item.intensitas_cahaya ?? 80;

              return (
                <div
                  key={scheduleId}
                  className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatIndoDate(item.created_at)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isActive ? (
                        <>
                          <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Aktif
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            Sedang berlaku
                          </span>
                        </>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          Nonaktif
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2.5 text-xs space-y-1.5 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Jam Operasional:</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {startTime} s/d {endTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Mode:</span>
                      <span className="font-semibold text-slate-800">
                        {isAuto ? `Auto (Target ${item.target_lux ?? 0} Lux)` : `Manual (${intensityVal}%)`}
                      </span>
                    </div>
                  </div>

                  {Boolean(item.keterangan || item.nama_jadwal) && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.keterangan || item.nama_jadwal}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="py-12 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-700">Belum Ada Riwayat Jadwal</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ditemukan catatan riwayat jadwal lampu untuk cakupan yang dipilih.
          </p>
        </div>
      )}
    </div>
  );
};
