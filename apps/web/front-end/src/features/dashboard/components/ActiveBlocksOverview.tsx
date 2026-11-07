import React from 'react';
import { Lightbulb, Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { ActiveBlockOverviewItem } from '../hooks/useDashboardData';

interface ActiveBlocksOverviewProps {
  items?: ActiveBlockOverviewItem[];
  isLoading?: boolean;
}

export const ActiveBlocksOverview: React.FC<ActiveBlocksOverviewProps> = ({
  items = [],
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 md:p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          <div>
            <h3 className="text-sm font-bold text-slate-900">Operasional Blok Lahan</h3>
            <p className="text-xs text-slate-500">Status penyinaran blok malam ini</p>
          </div>
        </div>
        <Link
          to="/kebun/farms"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
        >
          <span>Semua Blok</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-around py-1">
        {isLoading ? (
          <div className="py-6 space-y-3 animate-pulse">
            <div className="h-4 bg-slate-100 rounded-md w-3/4" />
            <div className="h-4 bg-slate-100 rounded-md w-1/2" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Belum ada operasional blok lahan aktif
          </div>
        ) : (
          items.slice(0, 4).map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-medium">
                  <span>{item.nodeCount} Node Sensor</span>
                  <span>•</span>
                  <span>{item.schedule}</span>
                </div>
              </div>
              <div className="flex items-center justify-end">
                {item.status === 'Menyala' ? (
                  <StatusBadge
                    status="Menyala"
                    variant="active"
                    icon={<Lightbulb className="w-3.5 h-3.5 shrink-0" />}
                  />
                ) : (
                  <StatusBadge status="Standby" variant="standby" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
