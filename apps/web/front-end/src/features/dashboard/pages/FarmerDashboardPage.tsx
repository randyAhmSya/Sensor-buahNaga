import React from 'react';
import { Download, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MOCK_DIMMING_CHART } from '@/data/mockSchedules';
import { DimmingBarChart } from '@/features/schedules/components/DimmingBarChart';
import { UpcomingHarvestWidget } from '../components/UpcomingHarvestWidget';
import { ActiveBlocksOverview } from '../components/ActiveBlocksOverview';

// Komponen metrik dan tabel telemetri yang sudah ada sebelumnya
import { DashboardMetricCards } from '../components/DashboardMetricCards';
import { RecentActivityTable } from '../components/RecentActivityTable';

export const FarmerDashboardPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header Dashboard & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Dashboard Utama</h1>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Senin, 24 Oktober 2026 • Siklus Induksi Pembungaan Aktif</span>
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

      {/* Alert Status Operasional - Minimalist Outline */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-rose-400 bg-white text-rose-700 text-xs font-semibold shadow-2xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>Perlu Tindakan: 3 Node Sensor Offline di Kebun Raya Bogor</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-600 bg-white text-emerald-800 text-xs font-semibold shadow-2xs">
          <Calendar className="w-4 h-4 shrink-0 text-emerald-700" />
          <span>Estimasi Panen Terdekat: Blok A (24 Nov 2026)</span>
        </div>
      </div>

      {/* 4 Kartu Metrik Utama */}
      <DashboardMetricCards />

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
            <span className="text-xs font-bold text-emerald-700 bg-white border border-emerald-600 px-2.5 py-0.5 rounded-full">
              Hemat Daya ~28%
            </span>
          </div>
          <div className="pt-2">
            <DimmingBarChart data={MOCK_DIMMING_CHART} />
          </div>
        </div>

        <div className="lg:col-span-5 h-full">
          <UpcomingHarvestWidget />
        </div>
      </div>

      {/* Baris Bawah: Operasional Blok Lahan & Telemetri Node (Konsisten 5 Kolom vs 7 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 h-full">
          <ActiveBlocksOverview />
        </div>

        <div className="lg:col-span-7 h-full">
          <RecentActivityTable />
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboardPage;
