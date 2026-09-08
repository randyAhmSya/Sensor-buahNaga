import React from 'react';
import { Lightbulb, Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/ui/StatusBadge';

const ACTIVE_BLOCK_ITEMS = [
  {
    id: 'blk-a',
    name: 'Blok A (Utara)',
    nodeCount: 12,
    lightIntensity: 85,
    schedule: '18:00 - 05:00',
    status: 'Menyala',
  },
  {
    id: 'blk-b',
    name: 'Blok B (Timur)',
    nodeCount: 8,
    lightIntensity: 70,
    schedule: '18:30 - 04:30',
    status: 'Menyala',
  },
  {
    id: 'blk-c',
    name: 'Blok C (Selatan)',
    nodeCount: 14,
    lightIntensity: 0,
    schedule: 'Mati (Istirahat)',
    status: 'Mati',
  },
];

export const ActiveBlocksOverview: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 md:p-6 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-700 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Operasional Blok Lahan</h3>
            <p className="text-xs text-slate-500">Status penyinaran blok malam ini</p>
          </div>
        </div>
        <Link
          to="/admin/farms"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
        >
          <span>Semua Blok</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-around py-1">
        {ACTIVE_BLOCK_ITEMS.map((item) => (
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
                  status={`${item.lightIntensity}%`}
                  variant="active"
                  icon={<Lightbulb className="w-3.5 h-3.5 shrink-0" />}
                />
              ) : (
                <StatusBadge status="Standby" variant="standby" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
