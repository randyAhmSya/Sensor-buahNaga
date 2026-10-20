import React from 'react';
import { DashboardMetricCard } from './DashboardMetricCard';
import type { DashboardCardMetricItem } from '@/types/telemetry';

interface DashboardMetricCardsProps {
  cards?: DashboardCardMetricItem[];
  isLoading?: boolean;
}

export const DashboardMetricCards: React.FC<DashboardMetricCardsProps> = ({
  cards = [],
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs animate-pulse space-y-4"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-xl" />
            <div className="space-y-2">
              <div className="h-3.5 w-28 bg-slate-100 rounded" />
              <div className="h-8 w-20 bg-slate-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((metric) => (
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
