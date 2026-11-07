import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SubscriptionWarningBanner } from '../components/SubscriptionWarningBanner';
import { DashboardMetricCards } from '../components/DashboardMetricCards';
import { UpcomingHarvestWidget } from '../components/UpcomingHarvestWidget';
import { ActiveBlocksOverview } from '../components/ActiveBlocksOverview';
import { RecentActivityTable } from '../components/RecentActivityTable';
import { DashboardAlertNotificationsWidget } from '../components/DashboardAlertNotificationsWidget';
import { LazyVisibleChart } from '@/components/common/LazyVisibleChart';
import { useDashboardData } from '../hooks/useDashboardData';
import { useSaasMode } from '@/context/SaasContext';

const LazyIntensityDimmingLineChart = React.lazy(() =>
  import('../components/IntensityDimmingLineChart').then((m) => ({
    default: m.IntensityDimmingLineChart,
  }))
);

const LazyNightlyEnergyBarChart = React.lazy(() =>
  import('../components/NightlyEnergyBarChart').then((m) => ({
    default: m.NightlyEnergyBarChart,
  }))
);

const ChartCardSkeleton: React.FC<{ minHeight?: string }> = ({ minHeight = 'min-h-[380px]' }) => (
  <div
    className={`w-full ${minHeight} bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between animate-pulse shadow-2xs`}
  >
    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
      <div className="space-y-1.5 w-1/3">
        <div className="h-4 bg-slate-200 rounded-md w-3/4" />
        <div className="h-3 bg-slate-100 rounded-md w-1/2" />
      </div>
      <div className="h-7 w-28 bg-slate-100 rounded-lg" />
    </div>
    <div className="flex-1 flex items-end gap-3 pt-6 pb-2">
      <div className="w-full h-3/4 bg-slate-100 rounded-lg" />
      <div className="w-full h-1/2 bg-slate-100 rounded-lg" />
      <div className="w-full h-4/5 bg-slate-100 rounded-lg" />
      <div className="w-full h-2/3 bg-slate-100 rounded-lg" />
      <div className="w-full h-full bg-slate-100 rounded-lg" />
    </div>
    <div className="flex justify-between pt-2">
      <div className="h-3 bg-slate-100 rounded w-16" />
      <div className="h-3 bg-slate-100 rounded w-16" />
    </div>
  </div>
);

export const FarmerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSaasEnabled } = useSaasMode();
  const {
    metricCards,
    recentActivities,
    activeBlocksList,
    cycles,
    subscriptionStatus,
    alertItems,
    dimmingOptions,
    selectedBlockNodeId,
    setSelectedBlockNodeId,
    dimmingChartData,
    isManualDimmingMode,
    manualBrightnessPercent,
    nightlyEnergyData,
    totalNightlyKwh,
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
      {/* Level 1: Subscription Warning Banner (Kondisional: Muncul jika mode SaaS aktif & <= 3 hari / masa tenggang / kadaluarsa) */}
      {isSaasEnabled && (
        <SubscriptionWarningBanner status={subscriptionStatus} isLoading={isLoading} />
      )}

      {/* Header Dashboard & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Dashboard Utama
          </h1>
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

      {/* Level 2: 4 Kartu Metrik Utama */}
      <DashboardMetricCards cards={metricCards} isLoading={isLoading} />

      {/* Level 3: Siklus Intensitas & Auto-Dimming (7 Kolom) vs Progres Panen (5 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 h-full">
          <LazyVisibleChart minHeight="min-h-[380px]" fallback={<ChartCardSkeleton minHeight="min-h-[380px]" />}>
            <Suspense fallback={<ChartCardSkeleton minHeight="min-h-[380px]" />}>
              <LazyIntensityDimmingLineChart
                options={dimmingOptions}
                selectedId={selectedBlockNodeId}
                onSelectId={setSelectedBlockNodeId}
                data={dimmingChartData}
                isManualMode={isManualDimmingMode}
                manualBrightnessPercent={manualBrightnessPercent}
                isLoading={isLoading}
              />
            </Suspense>
          </LazyVisibleChart>
        </div>

        <div className="lg:col-span-5 h-full">
          <UpcomingHarvestWidget initialCycles={cycles} isLoading={isLoading} />
        </div>
      </div>

      {/* Level 4: Operasional Blok Lahan (5 Kolom) vs Telemetri Node Terkini (7 Kolom) */}
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

      {/* Level 5: Energi per Malam 7 Hari (7 Kolom) vs Peringatan & Notifikasi (5 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 h-full">
          <LazyVisibleChart minHeight="min-h-[320px]" fallback={<ChartCardSkeleton minHeight="min-h-[320px]" />}>
            <Suspense fallback={<ChartCardSkeleton minHeight="min-h-[320px]" />}>
              <LazyNightlyEnergyBarChart
                data={nightlyEnergyData}
                totalKwh={totalNightlyKwh}
                isLoading={isLoading}
              />
            </Suspense>
          </LazyVisibleChart>
        </div>

        <div className="lg:col-span-5 h-full">
          <DashboardAlertNotificationsWidget
            alerts={alertItems}
            isLoading={isLoading}
            onViewAll={() => navigate('/petani/notifikasi')}
          />
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboardPage;
