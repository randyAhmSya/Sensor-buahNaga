import React from 'react';
import { Search } from 'lucide-react';

interface HarvestFilterBarProps {
  activeTab: 'Semua' | 'Berjalan' | 'Selesai';
  onTabChange: (tab: 'Semua' | 'Berjalan' | 'Selesai') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const HarvestFilterBar: React.FC<HarvestFilterBarProps> = ({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
}) => {
  const tabs: ('Semua' | 'Berjalan' | 'Selesai')[] = ['Semua', 'Berjalan', 'Selesai'];

  return (
    <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Tabs Filter */}
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
            {tab}
          </button>
        ))}
      </div>

      {/* Input Pencarian */}
      <div className="relative w-full md:w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari blok atau kebun..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-2xs"
        />
      </div>
    </div>
  );
};
