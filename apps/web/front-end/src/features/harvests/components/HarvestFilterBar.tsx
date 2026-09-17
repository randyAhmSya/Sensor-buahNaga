import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import type { HarvestCycleStatus } from '../types/harvest.types';
import type { BlockOptionItem } from './CreateHarvestCycleModal';

export type HarvestTabFilter = 'Semua' | HarvestCycleStatus;

interface HarvestFilterBarProps {
  activeTab: HarvestTabFilter;
  onTabChange: (tab: HarvestTabFilter) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedBlockId: string;
  onBlockChange: (blockId: string) => void;
  blocks: BlockOptionItem[];
}

export const HarvestFilterBar: React.FC<HarvestFilterBarProps> = ({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  selectedBlockId,
  onBlockChange,
  blocks,
}) => {
  const tabs: HarvestTabFilter[] = ['Semua', 'BERJALAN', 'SELESAI'];

  return (
    <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Tabs Filter Status */}
      <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 self-start">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'BERJALAN' ? 'Berjalan' : tab === 'SELESAI' ? 'Selesai' : 'Semua'}
          </button>
        ))}
      </div>

      {/* Kontrol Kanan: Filter Blok & Pencarian */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Dropdown Filter Blok */}
        <div className="relative min-w-[200px]">
          <select
            value={selectedBlockId}
            onChange={(e) => onBlockChange(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2 pr-9 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
          >
            <option value="ALL">Semua Blok Lahan</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.farmName ? `${b.farmName} — ${b.name}` : b.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Input Pencarian */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari blok atau kebun..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-2xs"
          />
        </div>
      </div>
    </div>
  );
};
