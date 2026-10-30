import type { FC } from 'react';
import { ChevronDown } from 'lucide-react';
import { DebouncedSearchInput } from '@/components/common/DebouncedSearchInput';

interface SensorFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedFarm: string;
  onFarmChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  farmOptions?: string[];
}

export const SensorFilterBar: FC<SensorFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedFarm,
  onFarmChange,
  selectedStatus,
  onStatusChange,
  farmOptions = [],
}) => {
  const uniqueFarms = ['Semua Kebun', ...Array.from(new Set(farmOptions))];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
      {/* Input Pencarian */}
      <div className="flex-1 max-w-full md:max-w-sm">
        <DebouncedSearchInput
          value={searchTerm}
          onDebouncedChange={onSearchChange}
          delay={1000}
          placeholder="Cari kode node (misal: ND-001)..."
          ariaLabel="Cari kode node sensor"
          className="w-full min-h-[44px] bg-white border-slate-200/90"
        />
      </div>

      {/* Filter Dropdown */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Dropdown Filter Kebun */}
        <div className="relative flex-1 sm:flex-none sm:w-52">
          <select
            value={selectedFarm}
            onChange={(e) => onFarmChange(e.target.value)}
            className="w-full appearance-none pl-3.5 pr-9 py-2.5 min-h-[44px] bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs transition-colors"
          >
            {uniqueFarms.map((farm) => (
              <option key={farm} value={farm}>
                {farm}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Dropdown Filter Status */}
        <div className="relative flex-1 sm:flex-none sm:w-44">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full appearance-none pl-3.5 pr-9 py-2.5 min-h-[44px] bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs transition-colors"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="belum_pernah_terlihat">Belum Pernah Terhubung</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
