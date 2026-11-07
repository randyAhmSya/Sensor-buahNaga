import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  Pencil,
  PowerOff,
  History,
  Plus,
  AlertCircle,
  Clock,
  Layers,
  Cpu,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  useScheduleSummaryQuery,
  useDeactivateScheduleMutation,
} from '@/hooks/queries/useSchedulesQuery';
import type {
  SumberJadwalLampu,
  JadwalLampuDefaultKebun,
  JadwalLampuBackend,
} from '@/services/scheduleService';

const getJadwalId = (j: JadwalLampuDefaultKebun | JadwalLampuBackend): string => {
  if (j.id_jadwal_lampu) return j.id_jadwal_lampu;
  const backend = j as JadwalLampuBackend;
  return backend.id_jadwal || backend.id || '';
};

const getJadwalStartTime = (j: JadwalLampuDefaultKebun | JadwalLampuBackend): string => {
  if (j.jam_mulai_nyala) return j.jam_mulai_nyala;
  const backend = j as JadwalLampuBackend;
  return backend.jam_mulai || '-';
};

const getJadwalEndTime = (j: JadwalLampuDefaultKebun | JadwalLampuBackend): string => {
  if (j.jam_akhir_nyala) return j.jam_akhir_nyala;
  const backend = j as JadwalLampuBackend;
  return backend.jam_selesai || '-';
};

export interface ScheduleSummaryTabProps {
  kebunId: string;
  kebunName: string;
  onSelectHistoryScope: (sensorId: string) => void;
  onNavigateToNewSchedule: (scope: 'kebun' | 'node', sensorId?: string) => void;
  onNavigateToEditSchedule: (scheduleId: string) => void;
}

type FilterChip = 'semua' | 'override' | 'default' | 'belum_ada' | 'tanpa_node';

export const ScheduleSummaryTab: React.FC<ScheduleSummaryTabProps> = ({
  kebunId,
  kebunName,
  onSelectHistoryScope,
  onNavigateToNewSchedule,
  onNavigateToEditSchedule,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterChip>('semua');
  const [confirmDeactivate, setConfirmDeactivate] = useState<{
    id: string;
    title: string;
    isOverride: boolean;
  } | null>(null);

  const { data: summaryResponse, isLoading, isError, error, refetch } =
    useScheduleSummaryQuery(kebunId);
  const deactivateMutation = useDeactivateScheduleMutation();

  const defaultKebun = summaryResponse?.data?.default_kebun || null;
  const rawNodes = useMemo(() => summaryResponse?.data?.node || [], [summaryResponse]);

  // Filter baris node secara client-side
  const filteredNodes = useMemo(() => {
    if (activeFilter === 'semua') return rawNodes;
    return rawNodes.filter((node) => node.sumber === activeFilter);
  }, [rawNodes, activeFilter]);

  // Hitung jumlah untuk setiap chip filter
  const filterCounts = useMemo(() => {
    const counts: Record<FilterChip, number> = {
      semua: rawNodes.length,
      override: 0,
      default: 0,
      belum_ada: 0,
      tanpa_node: 0,
    };
    rawNodes.forEach((n) => {
      if (counts[n.sumber] !== undefined) {
        counts[n.sumber]++;
      }
    });
    return counts;
  }, [rawNodes]);

  const handleConfirmDeactivate = async () => {
    if (!confirmDeactivate) return;
    try {
      await deactivateMutation.mutateAsync(confirmDeactivate.id);
      setConfirmDeactivate(null);
    } catch {
      // Error tertangani oleh mutasi TanStack Query
    }
  };

  const renderSumberBadge = (sumber: SumberJadwalLampu) => {
    switch (sumber) {
      case 'override':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Override Node
          </span>
        );
      case 'default':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Default Kebun
          </span>
        );
      case 'belum_ada':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Belum Ada Jadwal
          </span>
        );
      case 'tanpa_node':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
            Tanpa Node
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Skeleton Kartu Default */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="h-5 bg-slate-200 rounded-md w-1/4" />
          <div className="h-12 bg-slate-100 rounded-xl w-full" />
          <div className="h-4 bg-slate-100 rounded-md w-1/3" />
        </div>

        {/* Skeleton Tabel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="h-8 bg-slate-100 rounded-lg w-1/2" />
          <div className="space-y-3 pt-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 bg-slate-50 rounded-xl w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-3">
        <div className="flex items-center gap-3 text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <h3 className="font-bold text-sm md:text-base">Gagal memuat ringkasan jadwal lampu</h3>
        </div>
        <p className="text-xs md:text-sm text-slate-600">
          {error?.pesan || error?.message || 'Terjadi gangguan saat mengambil data ringkasan kebun.'}
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
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 1. KARTU JADWAL DEFAULT KEBUN */}
      {/* ============================================================== */}
      <section aria-labelledby="default-schedule-heading">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 md:p-6 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl border border-slate-200 bg-emerald-50/60 text-emerald-700 flex items-center justify-center shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h2 id="default-schedule-heading" className="text-base md:text-lg font-bold text-slate-900">
                  Jadwal Default Kebun
                </h2>
                <p className="text-xs text-slate-500">
                  Berlaku otomatis untuk semua blok dan node di {kebunName} yang tidak memiliki jadwal override khusus.
                </p>
              </div>
            </div>

            {defaultKebun ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateToEditSchedule(defaultKebun.id_jadwal_lampu)}
                  className="flex items-center gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  <Pencil className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Default</span>
                </Button>
                {Boolean(defaultKebun.status_aktif) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setConfirmDeactivate({
                        id: defaultKebun.id_jadwal_lampu,
                        title: `Jadwal Default Kebun (${kebunName})`,
                        isOverride: false,
                      })
                    }
                    className="flex items-center gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-semibold"
                  >
                    <PowerOff className="w-3.5 h-3.5" />
                    <span>Nonaktifkan</span>
                  </Button>
                )}
              </div>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => onNavigateToNewSchedule('kebun')}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Jadwal Default</span>
              </Button>
            )}
          </div>

          {defaultKebun ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Jam Operasional
                </span>
                <div className="text-slate-900 font-bold text-base tabular-nums flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{defaultKebun.jam_mulai_nyala}</span>
                  <span className="text-slate-400 font-normal text-xs">s/d</span>
                  <span>{defaultKebun.jam_akhir_nyala}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Mode Penyinaran
                </span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  {defaultKebun.mode === 'auto' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border-2 border-emerald-700 bg-white text-emerald-800 shadow-2xs">
                      <Cpu className="w-3.5 h-3.5 text-emerald-700" />
                      Auto-dimming
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border-2 border-slate-600 bg-white text-slate-800 shadow-2xs">
                      <Sun className="w-3.5 h-3.5 text-slate-700" />
                      Manual
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Parameter Intensitas
                </span>
                <p className="text-slate-900 font-semibold text-xs md:text-sm tabular-nums">
                  {defaultKebun.mode === 'auto'
                    ? `Target: ${defaultKebun.target_lux ?? 0} Lux (Base: ${defaultKebun.baseline_manual_persen ?? 70}%, Min: ${defaultKebun.intensitas_minimum ?? 10}%)`
                    : `Kecerahan: ${defaultKebun.instensitas_cahaya ?? defaultKebun.intensitas_cahaya ?? 80}%`}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Status Berlaku
                </span>
                <div className="pt-0.5">
                  {defaultKebun.status_aktif ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Aktif Beroperasi
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                      Nonaktif
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700">Belum Ada Jadwal Default Kebun</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Kebun ini belum memiliki jadwal default. Node sensor yang terpasang belum memiliki siklus penyinaran otomatis kecuali jika memiliki jadwal override khusus.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. CHIP FILTER KLIEN */}
      {/* ============================================================== */}
      <section aria-labelledby="filter-chips-heading" className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 id="filter-chips-heading" className="text-sm font-bold text-slate-900">
            Status Pencahayaan Per Blok & Node
          </h3>
          <span className="text-xs text-slate-500 font-medium tabular-nums">
            Menampilkan {filteredNodes.length} dari {rawNodes.length} entri
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(
            [
              { key: 'semua', label: 'Semua' },
              { key: 'override', label: 'Override' },
              { key: 'default', label: 'Default' },
              { key: 'belum_ada', label: 'Belum ada' },
              { key: 'tanpa_node', label: 'Tanpa node' },
            ] as const
          ).map((chip) => {
            const isSelected = activeFilter === chip.key;
            const count = filterCounts[chip.key];
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => setActiveFilter(chip.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-98 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. TABEL / KARTU DAFTAR NODE PER BLOK */}
      {/* ============================================================== */}
      <section aria-label="Tabel Node Pencahayaan" className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filteredNodes.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Blok</th>
                    <th className="py-3 px-4">Perangkat Node</th>
                    <th className="py-3 px-4">Sumber Jadwal</th>
                    <th className="py-3 px-4">Jam Operasional</th>
                    <th className="py-3 px-4">Pengaturan Penyinaran</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100">
                  {filteredNodes.map((node) => {
                    const jadwal = node.jadwal;
                    const hasSensor = Boolean(node.id_sensor);
                    const isOverride = node.sumber === 'override';
                    const isDefault = node.sumber === 'default';
                    const isBelumAda = node.sumber === 'belum_ada';
                    const isTanpaNode = node.sumber === 'tanpa_node';

                    return (
                      <tr key={node.id_blok + (node.id_sensor || 'no-sensor')} className="hover:bg-slate-50/60 transition-colors">
                        {/* Kolom Blok */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="font-bold text-slate-900">{node.nama_blok}</span>
                          </div>
                        </td>

                        {/* Kolom Node Sensor & Status Koneksi */}
                        <td className="py-3.5 px-4">
                          {hasSensor ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-slate-800">
                                {node.kode_perangkat || 'Node'}
                              </span>
                              <span
                                className={`inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold border ${
                                  node.status_koneksi === 'online' || node.status_koneksi === 'aktif'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}
                              >
                                {node.status_koneksi || 'aktif'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Belum terpasang</span>
                          )}
                        </td>

                        {/* Kolom Sumber */}
                        <td className="py-3.5 px-4">{renderSumberBadge(node.sumber)}</td>

                        {/* Kolom Jam Operasional */}
                        <td className="py-3.5 px-4">
                          {jadwal ? (
                            <div className="font-medium text-slate-800 text-xs tabular-nums flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{getJadwalStartTime(jadwal)}</span>
                              <span className="text-slate-400 font-normal">s/d</span>
                              <span>{getJadwalEndTime(jadwal)}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">-</span>
                          )}
                        </td>

                        {/* Kolom Pengaturan */}
                        <td className="py-3.5 px-4">
                          {jadwal ? (
                            <div className="text-xs">
                              {jadwal.mode === 'auto' ? (
                                <span className="text-teal-800 font-semibold tabular-nums">
                                  Auto (Target: {jadwal.target_lux ?? 0} Lux)
                                </span>
                              ) : (
                                <span className="text-emerald-800 font-semibold tabular-nums">
                                  Manual (Kecerahan: {jadwal.instensitas_cahaya ?? jadwal.intensitas_cahaya ?? 80}%)
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">Tidak ada siklus aktif</span>
                          )}
                        </td>

                        {/* Kolom Aksi */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* Tombol Lihat Riwayat untuk semua baris yang punya sensor */}
                            {hasSensor && node.id_sensor && (
                              <button
                                type="button"
                                onClick={() => onSelectHistoryScope(node.id_sensor!)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Lihat riwayat jadwal node ini di Tab Riwayat"
                              >
                                <History className="w-3.5 h-3.5" />
                                <span>Lihat riwayat</span>
                              </button>
                            )}

                            {/* Aksi khusus Override */}
                            {isOverride && jadwal && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    onNavigateToEditSchedule(getJadwalId(jadwal))
                                  }
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Edit override node"
                                  aria-label="Edit override node"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setConfirmDeactivate({
                                      id: getJadwalId(jadwal),
                                      title: `Override ${node.nama_blok} (${node.kode_perangkat})`,
                                      isOverride: true,
                                    })
                                  }
                                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Nonaktifkan override"
                                  aria-label="Nonaktifkan override node"
                                >
                                  <PowerOff className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {/* Aksi khusus Default (bisa buat override baru) */}
                            {isDefault && hasSensor && (
                              <button
                                type="button"
                                onClick={() => onNavigateToNewSchedule('node', node.id_sensor || undefined)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-200/80 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Atur override</span>
                              </button>
                            )}

                            {/* Aksi khusus Belum Ada */}
                            {isBelumAda && hasSensor && (
                              <button
                                type="button"
                                onClick={() => onNavigateToNewSchedule('node', node.id_sensor || undefined)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Atur jadwal</span>
                              </button>
                            )}

                            {/* Tautan Pasang Node Dulu untuk blok tanpa node */}
                            {isTanpaNode && (
                              <Link
                                to="/kebun/sensors"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                              >
                                <span>Pasang node dulu</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="lg:hidden p-4 space-y-3">
              {filteredNodes.map((node) => {
                const jadwal = node.jadwal;
                const hasSensor = Boolean(node.id_sensor);
                const isOverride = node.sumber === 'override';
                const isDefault = node.sumber === 'default';
                const isBelumAda = node.sumber === 'belum_ada';
                const isTanpaNode = node.sumber === 'tanpa_node';

                return (
                  <div
                    key={node.id_blok + (node.id_sensor || 'no-sensor')}
                    className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-3 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{node.nama_blok}</h4>
                          {renderSumberBadge(node.sumber)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Cpu className="w-3.5 h-3.5 text-slate-400" />
                          {hasSensor ? (
                            <span className="font-mono">{node.kode_perangkat}</span>
                          ) : (
                            <span className="italic">Tanpa perangkat sensor</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {jadwal && (
                      <div className="bg-slate-50 rounded-lg p-2.5 text-xs space-y-1.5 border border-slate-100">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-500">Jam Operasional:</span>
                          <span className="font-bold tabular-nums">
                            {getJadwalStartTime(jadwal)} s/d {getJadwalEndTime(jadwal)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="text-slate-500">Pengaturan:</span>
                          <span className="font-semibold tabular-nums">
                            {jadwal.mode === 'auto'
                              ? `Auto (Target ${jadwal.target_lux ?? 0} Lux)`
                              : `Manual (${jadwal.instensitas_cahaya ?? jadwal.intensitas_cahaya ?? 80}%)`}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      {hasSensor && node.id_sensor && (
                        <button
                          type="button"
                          onClick={() => onSelectHistoryScope(node.id_sensor!)}
                          className="text-xs font-semibold text-slate-600 hover:text-emerald-700 flex items-center gap-1"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Lihat riwayat</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        {isOverride && jadwal && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                onNavigateToEditSchedule(getJadwalId(jadwal))
                              }
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmDeactivate({
                                  id: getJadwalId(jadwal),
                                  title: `Override ${node.nama_blok} (${node.kode_perangkat})`,
                                  isOverride: true,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center gap-1"
                            >
                              <PowerOff className="w-3 h-3" />
                              <span>Nonaktifkan</span>
                            </button>
                          </>
                        )}

                        {isDefault && hasSensor && (
                          <button
                            type="button"
                            onClick={() => onNavigateToNewSchedule('node', node.id_sensor || undefined)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 border border-emerald-200 bg-emerald-50/50 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Atur override</span>
                          </button>
                        )}

                        {isBelumAda && hasSensor && (
                          <button
                            type="button"
                            onClick={() => onNavigateToNewSchedule('node', node.id_sensor || undefined)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Atur jadwal</span>
                          </button>
                        )}

                        {isTanpaNode && (
                          <Link
                            to="/kebun/sensors"
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                          >
                            <span>Pasang node</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="py-12 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">Tidak Ada Data Blok/Node</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ditemukan data node untuk kriteria filter &quot;{activeFilter}&quot; pada kebun ini.
            </p>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 4. MODAL KONFIRMASI NONAKTIFKAN */}
      {/* ============================================================== */}
      <Modal
        isOpen={Boolean(confirmDeactivate)}
        onClose={() => setConfirmDeactivate(null)}
        title={confirmDeactivate?.isOverride ? 'Nonaktifkan Jadwal Override?' : 'Nonaktifkan Jadwal Default Kebun?'}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
            {confirmDeactivate?.isOverride ? (
              <>
                Anda akan menonaktifkan konfigurasi jadwal override untuk{' '}
                <strong className="text-slate-900">{confirmDeactivate.title}</strong>. Setelah override dinonaktifkan, node ini akan otomatis kembali memakai konfigurasi jadwal default kebun.
              </>
            ) : (
              <>
                Anda akan menonaktifkan konfigurasi jadwal default untuk{' '}
                <strong className="text-slate-900">{confirmDeactivate?.title}</strong>. Node yang mengandalkan jadwal default tidak akan menyala secara otomatis sampai diaktifkan kembali.
              </>
            )}
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setConfirmDeactivate(null)}
              disabled={deactivateMutation.isPending}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={handleConfirmDeactivate}
              disabled={deactivateMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-2"
            >
              {deactivateMutation.isPending ? 'Memproses...' : 'Ya, Nonaktifkan'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
