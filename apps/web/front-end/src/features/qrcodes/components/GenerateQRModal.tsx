import React, { useState, useEffect } from 'react';
import { X, QrCode, Plus, ChevronDown, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { farmService } from '@/services/farmService';
import { blockService } from '@/services/blockService';
import { qrCodeService, mapQrBackendToItem } from '@/services/qrService';
import type { FarmItem } from '@/types/farm.types';
import type { BlockItem } from '@/types/block.types';
import type { QRCodeItem } from '@/types/qr.types';

interface GenerateQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: {
    farmName: string;
    blockName: string;
    codeText: string;
    newItem?: QRCodeItem;
  }) => void;
}

export const GenerateQRModal: React.FC<GenerateQRModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [farms, setFarms] = useState<FarmItem[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');

  const [isLoadingFarms, setIsLoadingFarms] = useState(false);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [randomSuffix, setRandomSuffix] = useState(() =>
    Math.floor(1000 + Math.random() * 9000).toString()
  );

  // 1. Fetch kebun saat modal dibuka
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoadingFarms(true);
    setErrorMessage(null);

    farmService
      .getAll()
      .then((data) => {
        if (!isMounted) return;
        setFarms(data);
        setIsLoadingFarms(false);
        if (data.length > 0) {
          setSelectedFarmId(data[0].id);
        } else {
          setSelectedFarmId('');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoadingFarms(false);
        setFarms([]);
        setSelectedFarmId('');
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // 2. Fetch blok dependen saat selectedFarmId berubah
  useEffect(() => {
    if (!selectedFarmId) {
      setBlocks([]);
      setSelectedBlockId('');
      return;
    }

    let isMounted = true;
    setIsLoadingBlocks(true);

    blockService
      .getBlocksByFarmId(selectedFarmId)
      .then((data) => {
        if (!isMounted) return;
        setBlocks(data);
        setIsLoadingBlocks(false);
        if (data.length > 0) {
          setSelectedBlockId(data[0].id);
        } else {
          setSelectedBlockId('');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoadingBlocks(false);
        setBlocks([]);
        setSelectedBlockId('');
      });

    return () => {
      isMounted = false;
    };
  }, [selectedFarmId]);

  if (!isOpen) return null;

  // Temukan nama kebun dan blok terpilih
  const selectedFarmObj = farms.find((f) => f.id === selectedFarmId);
  const selectedBlockObj = blocks.find((b) => b.id === selectedBlockId);

  // Kode unik sistem
  const generatedCode = `AGL-${randomSuffix}`;

  const handleRefreshCode = () => {
    setRandomSuffix(Math.floor(1000 + Math.random() * 9000).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmId) {
      setErrorMessage('Silakan pilih kebun terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await qrCodeService.create({
        teks_kode_qr: generatedCode,
        kode_unik: generatedCode,
        blok_id: selectedBlockId || undefined,
        kebun_id: selectedFarmId,
        status_qr: true,
      });

      const mappedItem: QRCodeItem = res?.data
        ? mapQrBackendToItem(res.data)
        : {
            id: `qr-${Date.now()}`,
            codeText: generatedCode,
            qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generatedCode)}`,
            farmName: selectedFarmObj?.name || 'Kebun Buah Naga',
            blockName: selectedBlockObj?.name || 'Semua Blok',
            status: 'Aktif',
            pairingStatus: 'Belum Terhubung',
            createdAt: 'Baru Saja',
          };

      onSuccess({
        farmName: selectedFarmObj?.name || 'Kebun Buah Naga',
        blockName: selectedBlockObj?.name || 'Semua Blok',
        codeText: generatedCode,
        newItem: mappedItem,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal men-generate kode QR baru.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
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
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Pesan Error Inline jika Ada */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Dropdown Kebun */}
          <div className="space-y-1.5">
            <label htmlFor="qr-farm-select" className="block text-sm font-semibold text-slate-800">
              Pilih Kebun <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="qr-farm-select"
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                disabled={isLoadingFarms || farms.length === 0 || isSubmitting}
                className="w-full appearance-none bg-white border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-medium text-slate-800 outline-none pr-10 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed transition-all shadow-xs"
              >
                {isLoadingFarms ? (
                  <option value="">Memuat daftar kebun...</option>
                ) : farms.length === 0 ? (
                  <option value="">Tidak ada kebun tersedia</option>
                ) : (
                  <>
                    <option value="">-- Pilih Kebun --</option>
                    {farms.map((farm) => (
                      <option key={farm.id} value={farm.id}>
                        {farm.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Dropdown Blok (Dependent) */}
          <div className="space-y-1.5">
            <label htmlFor="qr-block-select" className="block text-sm font-semibold text-slate-800">
              Pilih Blok Lahan (Opsional)
            </label>
            <div className="relative">
              <select
                id="qr-block-select"
                value={selectedBlockId}
                onChange={(e) => setSelectedBlockId(e.target.value)}
                disabled={!selectedFarmId || isLoadingBlocks || blocks.length === 0 || isSubmitting}
                className="w-full appearance-none bg-white border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-medium text-slate-800 outline-none pr-10 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed transition-all shadow-xs"
              >
                {!selectedFarmId ? (
                  <option value="">Pilih kebun terlebih dahulu</option>
                ) : isLoadingBlocks ? (
                  <option value="">Memuat daftar blok...</option>
                ) : blocks.length === 0 ? (
                  <option value="">Tidak ada blok di kebun ini</option>
                ) : (
                  <>
                    <option value="">-- Semua Blok / Umum --</option>
                    {blocks.map((blk) => (
                      <option key={blk.id} value={blk.id}>
                        {blk.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500">
              {selectedFarmObj
                ? `Daftar blok disesuaikan dengan area ${selectedFarmObj.name}.`
                : 'Daftar blok disesuaikan dengan kebun yang dipilih.'}
            </p>
          </div>

          {/* Kode Unik Terbuat Otomatis */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="qr-code-text" className="block text-sm font-semibold text-slate-800">
                Kode Unik Sistem
              </label>
              <button
                type="button"
                onClick={handleRefreshCode}
                disabled={isSubmitting}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Acak Ulang</span>
              </button>
            </div>
            <input
              id="qr-code-text"
              type="text"
              readOnly
              value={generatedCode}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-800 outline-none cursor-not-allowed shadow-2xs"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="pt-3 flex gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting || isLoadingFarms}
              className="flex-1 flex flex-row items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  <span>Men-generate...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 shrink-0" />
                  <span>Generate Sekarang</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

