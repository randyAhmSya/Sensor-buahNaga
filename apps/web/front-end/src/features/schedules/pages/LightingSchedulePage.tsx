import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, ChevronDown, Building2, LayoutGrid, History } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useFarmsQuery } from '@/hooks/queries/useFarmsQuery';
import { ScheduleSummaryTab } from '../components/ScheduleSummaryTab';
import { ScheduleHistoryTab } from '../components/ScheduleHistoryTab';

type ActiveTab = 'ringkasan' | 'riwayat';

export const LightingSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab aktif (sinkron dengan query param 'tab' jika ada)
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const tabParam = searchParams.get('tab');
    return tabParam === 'riwayat' ? 'riwayat' : 'ringkasan';
  });

  // Cakupan sensor yang dipilih di Tab Riwayat ('default' atau sensor UUID)
  const [historyScope, setHistoryScope] = useState<string>('default');

  // Query daftar kebun
  const { data: farms = [], isLoading: isLoadingFarms } = useFarmsQuery();

  // State ID kebun terpilih
  const [selectedKebunId, setSelectedKebunId] = useState<string>(() => {
    return searchParams.get('kebun_id') || '';
  });

  // Auto-select kebun pertama saat daftar kebun telah selesai dimuat
  useEffect(() => {
    if (farms.length > 0 && !selectedKebunId) {
      const firstFarmId = farms[0].id;
      setSelectedKebunId(firstFarmId);
      setSearchParams((prev) => {
        prev.set('kebun_id', firstFarmId);
        return prev;
      }, { replace: true });
    }
  }, [farms, selectedKebunId, setSearchParams]);

  // Handler pergantian kebun
  const handleFarmChange = (newFarmId: string) => {
    setSelectedKebunId(newFarmId);
    setHistoryScope('default');
    setSearchParams((prev) => {
      prev.set('kebun_id', newFarmId);
      return prev;
    });
  };

  // Handler pergantian tab
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      prev.set('tab', tab);
      return prev;
    });
  };

  // Handler ketika klik "Lihat riwayat" dari baris node di Tab Ringkasan
  const handleSelectHistoryScopeFromSummary = (sensorId: string) => {
    setHistoryScope(sensorId);
    setActiveTab('riwayat');
    setSearchParams((prev) => {
      prev.set('tab', 'riwayat');
      return prev;
    });
  };

  const handleNavigateToNew = (scope: 'kebun' | 'node' = 'kebun', sensorId?: string) => {
    if (scope === 'node' && sensorId) {
      navigate(`/kebun/schedules/new?scope=node&kebun_id=${selectedKebunId}&sensor_id=${sensorId}`);
    } else {
      navigate(`/kebun/schedules/new?scope=kebun&kebun_id=${selectedKebunId}`);
    }
  };

  const handleNavigateToEdit = (scheduleId: string) => {
    navigate(`/kebun/schedules/${scheduleId}/edit`);
  };

  const selectedFarm = farms.find((f) => f.id === selectedKebunId);
  const selectedFarmName = selectedFarm ? selectedFarm.name : 'Kebun Buah Naga';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ============================================================== */}
      {/* HEADER HALAMAN & KONTROL UTAMA */}
      {/* ============================================================== */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Jadwal Lampu
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Konfigurasi siklus pencahayaan otomatis dan riwayat operasional penerangan kebun.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Dropdown Wajib Pilih Kebun */}
          <div className="relative min-w-[220px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Building2 className="w-4 h-4" />
            </div>
            <select
              aria-label="Pilih Kebun"
              value={selectedKebunId}
              disabled={isLoadingFarms || farms.length === 0}
              onChange={(e) => handleFarmChange(e.target.value)}
              className="w-full appearance-none pl-9 pr-9 py-2.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-emerald-600 rounded-xl text-xs md:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer shadow-2xs"
            >
              {farms.length === 0 && (
                <option value="">{isLoadingFarms ? 'Memuat daftar kebun...' : 'Belum ada kebun'}</option>
              )}
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Tombol Tambah Jadwal */}
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={!selectedKebunId}
            onClick={() => handleNavigateToNew('kebun')}
            className="min-h-[42px] px-4 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs whitespace-nowrap cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Tambah Jadwal</span>
          </Button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* TAB SWITCHER: RINGKASAN & RIWAYAT */}
      {/* ============================================================== */}
      <nav aria-label="Tab Navigasi Jadwal Lampu" className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          onClick={() => handleTabChange('ringkasan')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ringkasan'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Ringkasan</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('riwayat')}
          className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'riwayat'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat</span>
        </button>
      </nav>

      {/* ============================================================== */}
      {/* KONTEN TAB */}
      {/* ============================================================== */}
      {selectedKebunId ? (
        <main>
          {activeTab === 'ringkasan' ? (
            <ScheduleSummaryTab
              kebunId={selectedKebunId}
              kebunName={selectedFarmName}
              onSelectHistoryScope={handleSelectHistoryScopeFromSummary}
              onNavigateToNewSchedule={handleNavigateToNew}
              onNavigateToEditSchedule={handleNavigateToEdit}
            />
          ) : (
            <ScheduleHistoryTab
              kebunId={selectedKebunId}
              kebunName={selectedFarmName}
              selectedScope={historyScope}
              onScopeChange={setHistoryScope}
            />
          )}
        </main>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">Pilih Kebun Terlebih Dahulu</h3>
          <p className="text-xs md:text-sm text-slate-500 max-w-sm mx-auto">
            Silakan pilih salah satu kebun pada dropdown di atas untuk mengelola konfigurasi jadwal lampu.
          </p>
        </div>
      )}
    </div>
  );
};

export default LightingSchedulePage;
