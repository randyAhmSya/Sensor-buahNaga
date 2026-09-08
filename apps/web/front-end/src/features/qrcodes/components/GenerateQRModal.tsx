import React, { useState, useMemo } from 'react';
import { X, QrCode, Plus, ChevronDown, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getFarmNames, getBlocksByFarmName } from '@/data/centralData';

interface GenerateQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: { farmName: string; blockName: string; codeText: string }) => void;
}

export const GenerateQRModal: React.FC<GenerateQRModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const farmNames = useMemo(() => getFarmNames(), []);
  const [selectedFarmName, setSelectedFarmName] = useState(farmNames[0] || 'Kebun Raya Bogor');

  // Ambil daftar blok yang hanya milik kebun yang dipilih dari centralized master data
  const availableBlocks = useMemo(() => {
    return getBlocksByFarmName(selectedFarmName);
  }, [selectedFarmName]);

  const [selectedBlockName, setSelectedBlockName] = useState(availableBlocks[0]?.name || 'Blok A (Utara)');
  const [randomSuffix, setRandomSuffix] = useState(
    Math.floor(1000 + Math.random() * 9000).toString()
  );

  // Cari prefix kode dari blok yang terpilih
  const currentBlock = availableBlocks.find((b) => b.name === selectedBlockName) || availableBlocks[0];
  const generatedCode = `${currentBlock?.codePrefix || 'AGL'}-${randomSuffix}`;

  if (!isOpen) return null;

  const handleFarmChange = (farmName: string) => {
    setSelectedFarmName(farmName);
    const blocks = getBlocksByFarmName(farmName);
    if (blocks.length > 0) {
      setSelectedBlockName(blocks[0].name);
    }
  };

  const handleRefreshCode = () => {
    setRandomSuffix(Math.floor(1000 + Math.random() * 9000).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      farmName: selectedFarmName,
      blockName: selectedBlockName,
      codeText: generatedCode,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">Generate QR Code Baru</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Dropdown Kebun */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Pilih Kebun *</label>
            <div className="relative">
              <select
                value={selectedFarmName}
                onChange={(e) => handleFarmChange(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none pr-9 cursor-pointer"
              >
                {farmNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Dropdown Blok (Otomatis menyesuaikan kebun) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Pilih Blok Lahan *</label>
            <div className="relative">
              <select
                value={selectedBlockName}
                onChange={(e) => setSelectedBlockName(e.target.value)}
                className="w-full appearance-none bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none pr-9 cursor-pointer"
              >
                {availableBlocks.map((blk) => (
                  <option key={blk.id} value={blk.name}>
                    {blk.name} ({blk.codePrefix})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400">
              Daftar blok disesuaikan otomatis dengan area {selectedFarmName}.
            </p>
          </div>

          {/* Kode Unik Terbuat Otomatis */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-slate-700">Kode Unik Sistem</label>
              <button
                type="button"
                onClick={handleRefreshCode}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Acak Ulang</span>
              </button>
            </div>
            <input
              type="text"
              readOnly
              value={generatedCode}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-800 outline-none cursor-not-allowed"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="pt-3 flex gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              className="flex-1 border-slate-300 text-slate-700 font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="flex-1 flex flex-row items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Generate Sekarang</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
