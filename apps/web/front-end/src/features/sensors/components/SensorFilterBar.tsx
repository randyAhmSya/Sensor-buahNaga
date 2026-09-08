import React from 'react'
import { Search, ChevronDown } from 'lucide-react'

interface SensorFilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedFarm: string
  onFarmChange: (value: string) => void
  selectedStatus: string
  onStatusChange: (value: string) => void
}

export const SensorFilterBar: React.FC<SensorFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedFarm,
  onFarmChange,
  selectedStatus,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
      {/* Input Pencarian */}
      <div className="relative flex-1 max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari kode node (ND-001)..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-600 shadow-2xs"
        />
      </div>

      {/* Filter Dropdown */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={selectedFarm}
            onChange={(e) => onFarmChange(e.target.value)}
            className="appearance-none pl-3.5 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
          >
            <option value="Semua Kebun">Semua Kebun</option>
            <option value="Kebun Raya Bogor">Kebun Raya Bogor</option>
            <option value="Lembang Farm House">Lembang Farm House</option>
            <option value="Indoor Farm BSD">Indoor Farm BSD</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none pl-3.5 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
