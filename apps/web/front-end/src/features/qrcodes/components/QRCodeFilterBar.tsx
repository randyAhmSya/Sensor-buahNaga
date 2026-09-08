import React from 'react';
import { Search } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { getFarmNames } from '@/data/centralData';

interface QRCodeFilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedFarm: string;
  onFarmChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  selectedPairing: string;
  onPairingChange: (val: string) => void;
}

export const QRCodeFilterBar: React.FC<QRCodeFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedFarm,
  onFarmChange,
  selectedStatus,
  onStatusChange,
  selectedPairing,
  onPairingChange,
}) => {
  const farmOptions = [
    { label: 'Semua Kebun', value: 'Semua Kebun' },
    ...getFarmNames().map((name) => ({ label: name, value: name })),
  ];

  const statusOptions = [
    { label: 'Status (Semua)', value: 'Semua Status' },
    { label: 'Aktif', value: 'Aktif' },
    { label: 'Nonaktif', value: 'Nonaktif' },
  ];

  const pairingOptions = [
    { label: 'Pairing (Semua)', value: 'Semua Pairing' },
    { label: 'Sudah Terhubung', value: 'Sudah Terhubung' },
    { label: 'Belum Terhubung', value: 'Belum Terhubung' },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-2xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari kode (AGL-BLOK...) atau nama blok..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs md:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-2xs"
          />
        </div>

        {/* Filter Custom Selects */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <CustomSelect
            value={selectedFarm}
            onChange={onFarmChange}
            options={farmOptions}
          />
          <CustomSelect
            value={selectedStatus}
            onChange={onStatusChange}
            options={statusOptions}
          />
          <CustomSelect
            value={selectedPairing}
            onChange={onPairingChange}
            options={pairingOptions}
          />
        </div>
      </div>
    </div>
  );
};
