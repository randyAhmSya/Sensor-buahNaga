import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DimmingBarChart } from '@/features/schedules/components/DimmingBarChart';
import { UpcomingHarvestWidget } from '../components/UpcomingHarvestWidget';
import { ActiveBlocksOverview } from '../components/ActiveBlocksOverview';
import { DashboardMetricCards } from '../components/DashboardMetricCards';
import { RecentActivityTable } from '../components/RecentActivityTable';
import { useDashboardData } from '../hooks/useDashboardData';

export const FarmerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    metricCards,
    offlineNodes,
    recentActivities,
    activeBlocksList,
    cycles,
    isLoading,
  } = useDashboardData();

  const todayText = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header Dashboard & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Dashboard Utama</h1>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayText}</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => alert('Mengekspor ringkasan laporan kebun...')}
          className="flex flex-row items-center justify-center gap-2 border-slate-300 text-slate-700 hover:bg-white font-semibold shadow-2xs"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>Export Laporan</span>
        </Button>
      </div>

      {/* Alert Status Operasional saat ada node offline */}
      {offlineNodes > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 text-xs font-semibold shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Perlu Tindakan: {offlineNodes} Node Sensor Offline</span>
          </div>
        </div>
      )}

      {/* 4 Kartu Metrik Utama */}
      <DashboardMetricCards cards={metricCards} isLoading={isLoading} />

      {/* Baris Tengah: Grafik & Progres Panen (7 Kolom vs 5 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 md:p-6 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm md:text-base font-bold text-slate-900">
                Siklus Intensitas Lampu & Auto-Dimming
              </h3>
              <p className="text-xs text-slate-500">Rata-rata intensitas pencahayaan per jam malam tadi</p>
            </div>
          </div>
          <div className="pt-2">
            <DimmingBarChart data={[]} />
          </div>
        </div>

        <div className="lg:col-span-5 h-full">
          <UpcomingHarvestWidget initialCycles={cycles} />
        </div>
      </div>

      {/* Baris Bawah: Operasional Blok Lahan & Telemetri Node (Konsisten 5 Kolom vs 7 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 h-full">
          <ActiveBlocksOverview items={activeBlocksList} isLoading={isLoading} />
        </div>

        <div className="lg:col-span-7 h-full">
          <RecentActivityTable
            activities={recentActivities}
            onViewAll={() => navigate('/kebun/sensors')}
          />
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboardPage;
