import React from 'react';
import { Sprout, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { MetricStatCard } from '@/components/ui/MetricStatCard';
import type { HarvestMetrics } from '../types/harvest.types';

interface HarvestSummaryCardsProps {
  metrics: HarvestMetrics;
}

export const HarvestSummaryCards: React.FC<HarvestSummaryCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Siklus Berjalan */}
      <MetricStatCard
        title="Siklus Panen Berjalan"
        value={metrics.activeCycles}
        unit="Blok Aktif"
        icon={Sprout}
        description="Tanaman sedang dalam fase induksi atau pembungaan"
      />

      {/* Estimasi Panen Terdekat */}
      <MetricStatCard
        title="Estimasi Panen Terdekat"
        value={metrics.nearestHarvestDate ? formatDate(metrics.nearestHarvestDate) : 'Belum Ada'}
        icon={CalendarCheck}
        description={metrics.nearestHarvestDate ? 'Proyeksi panen buah berikutnya' : 'Belum ada siklus aktif'}
      />

      {/* Total Siklus Selesai */}
      <MetricStatCard
        title="Total Siklus Selesai"
        value={metrics.completedCycles}
        unit="Terselesaikan"
        icon={CheckCircle2}
        description="Riwayat panen sukses yang telah dicatat"
        className="sm:col-span-2 lg:col-span-1"
      />
    </div>
  );
};
