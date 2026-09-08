import React, { useMemo } from 'react';
import { DashboardMetricCard } from './DashboardMetricCard';
import { getDashboardMetrics, getDashboardMetricCards } from '@/data/mockTelemetry';

export const DashboardMetricCards: React.FC = () => {
  const metrics = useMemo(() => getDashboardMetrics(), []);
  const metricCards = useMemo(() => getDashboardMetricCards(metrics), [metrics]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {metricCards.map((metric) => (
        <DashboardMetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          unit={metric.unit}
          unitColor={metric.unitColor}
          icon={metric.icon}
          iconColor={metric.iconColor}
          badgeText={metric.badgeText}
          badgeVariant={metric.badgeVariant}
        />
      ))}
    </div>
  );
};
