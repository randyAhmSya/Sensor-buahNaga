import type { FC } from 'react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DebouncedSearchInput } from '@/components/common/DebouncedSearchInput';

interface QRCodeFilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedFarm: string;
  onFarmChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  selectedPairing: string;
  onPairingChange: (val: string) => void;
  farmOptions?: { label: string; value: string }[];
}

export const QRCodeFilterBar: FC<QRCodeFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedFarm,
  onFarmChange,
  selectedStatus,
  onStatusChange,
  selectedPairing,
  onPairingChange,
  farmOptions = [{ label: 'Semua Kebun', value: 'Semua Kebun' }],
}) => {
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
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/90 shadow-2xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 md:gap-4">
        {/* Search */}
        <div className="flex-1">
          <DebouncedSearchInput
            value={searchTerm}
            onDebouncedChange={onSearchChange}
            delay={1000}
            placeholder="Cari kode (AGL-BLOK...) atau nama blok..."
            ariaLabel="Cari kode QR blok atau nama blok"
            className="w-full min-h-[44px] bg-white border-slate-200"
          />
        </div>

        {/* Filter Custom Selects */}
        <div className="grid grid-cols-1 sm:flex sm:flex-wrap lg:flex-nowrap items-center gap-2.5">
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
