import type { FC } from 'react';
import { ChevronDown } from 'lucide-react';
import { DebouncedSearchInput } from '@/components/common/DebouncedSearchInput';
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

export const HarvestFilterBar: FC<HarvestFilterBarProps> = ({
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
    <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Tabs Filter Status */}
      <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/70 overflow-x-auto w-full sm:w-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`flex-1 sm:flex-none px-4 py-2.5 min-h-[44px] rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer text-center whitespace-nowrap active:scale-95 ${
              activeTab === tab
                ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/90'
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
        <div className="relative w-full sm:w-56 md:w-64">
          <select
            value={selectedBlockId}
            onChange={(e) => onBlockChange(e.target.value)}
            className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 min-h-[44px] pr-9 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 shadow-2xs cursor-pointer"
          >
            <option value="ALL">Semua Blok Lahan</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.farmName ? `${b.farmName} - ${b.name}` : b.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Input Pencarian */}
        <div className="w-full sm:w-60 md:w-72">
          <DebouncedSearchInput
            value={searchTerm}
            onDebouncedChange={onSearchChange}
            delay={1000}
            placeholder="Cari blok atau kebun..."
            ariaLabel="Cari jadwal panen blok atau kebun"
            className="w-full min-h-[44px] bg-white border-slate-200"
          />
        </div>
      </div>
    </div>
  );
};
