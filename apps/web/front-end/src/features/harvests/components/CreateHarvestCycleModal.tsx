import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Sparkles, ChevronDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { harvestService } from '@/services/harvestService';
import type { HarvestCycle } from '../types/harvest.types';

export interface BlockOptionItem {
  id: string; // UUID blok
  name: string; // nama blok
  farmName?: string; // nama kebun
}

interface CreateHarvestCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCycle: HarvestCycle) => void;
  blocks: BlockOptionItem[];
  defaultBlockId?: string;
}

export const CreateHarvestCycleModal: React.FC<CreateHarvestCycleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  blocks,
  defaultBlockId,
}) => {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [lightingDate, setLightingDate] = useState<string>(todayStr);
  const [bloomingTargetDays, setBloomingTargetDays] = useState<number>(20);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (defaultBlockId && blocks.some((b) => b.id === defaultBlockId)) {
        setSelectedBlockId(defaultBlockId);
      } else if (blocks.length > 0) {
        setSelectedBlockId(blocks[0].id);
      }
      setLightingDate(todayStr);
      setBloomingTargetDays(20);
      setErrorMsg(null);
      setIsSubmitting(false);
    }
  }, [isOpen, defaultBlockId, blocks, todayStr]);

  // Kalkulasi proyeksi tanggal panen: tanggal_penyinaran + target_hari_berbunga + 30 hari pematangan
  const projectedHarvestDate = useMemo(() => {
    if (!lightingDate) return '';
    const date = new Date(lightingDate);
    if (isNaN(date.getTime())) return '';
    const totalDays = Number(bloomingTargetDays || 20) + 30;
    date.setDate(date.getDate() + totalDays);
    return date.toISOString().split('T')[0];
  }, [lightingDate, bloomingTargetDays]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlockId) {
      setErrorMsg('Pilih blok lahan aktif terlebih dahulu');
      return;
    }
    if (!lightingDate) {
      setErrorMsg('Tanggal mulai penyinaran wajib diisi');
      return;
    }
    if (!bloomingTargetDays || bloomingTargetDays < 1) {
      setErrorMsg('Target hari berbunga minimal 1 hari');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
      const created = await harvestService.startHarvestCycle({
        block_id: selectedBlockId,
        tanggal_penyinaran: lightingDate,
        target_hari_berbunga: Number(bloomingTargetDays),
      });

      // Tambahkan nama blok & kebun jika belum terisi dari backend
      const enriched: HarvestCycle = {
        ...created,
        blockName: created.blockName || selectedBlock?.name || 'Blok Lahan',
        farmName: created.farmName || selectedBlock?.farmName || 'Kebun Buah Naga',
      };

      onSuccess(enriched);
      onClose();
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Gagal memulai siklus panen baru. Periksa koneksi ke server.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Mulai Siklus Panen Baru</h3>
              <p className="text-xs text-slate-500">Inisiasi perlakuan fotoperiode lampu untuk memacu induksi bunga.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Pilih Blok Lahan Aktif */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Pilih Blok Lahan <span className="text-rose-600 font-bold">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedBlockId}
                onChange={(e) => setSelectedBlockId(e.target.value)}
                required
                className="w-full appearance-none bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none cursor-pointer shadow-2xs pr-10"
              >
                {blocks.length === 0 ? (
                  <option value="">Tidak ada blok aktif tersedia</option>
                ) : (
                  blocks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.farmName ? `${b.farmName} — ${b.name}` : b.name}
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400">Blok terdaftar yang akan menerima induksi pencahayaan malam.</p>
          </div>

          {/* Tanggal Mulai Penyinaran */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Tanggal Mulai Penyinaran <span className="text-rose-600 font-bold">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={lightingDate}
                onChange={(e) => setLightingDate(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none shadow-2xs"
              />
            </div>
            <p className="text-[11px] text-slate-400">Hari pertama lampu LED diaktifkan saat malam hari.</p>
          </div>

          {/* Target Hari Berbunga (Default: 20) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Target Hari Berbunga (Hari) <span className="text-rose-600 font-bold">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="60"
                required
                value={bloomingTargetDays}
                onChange={(e) => setBloomingTargetDays(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none shadow-2xs"
                placeholder="Standar: 20 hari"
              />
            </div>
            <p className="text-[11px] text-slate-400">Durasi rata-rata hingga kuncup bunga pertama mekar (standar: 20 hari).</p>
          </div>

          {/* Proyeksi Estimasi Panen Otomatis */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                Kalkulasi Estimasi Tanggal Panen:
              </span>
              <span className="font-bold text-emerald-800 text-sm">{projectedHarvestDate || '—'}</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed flex items-center gap-1">
              <Clock className="w-3 h-3 shrink-0 text-emerald-600" />
              Dihitung otomatis: penyinaran + target mekar ({bloomingTargetDays} hari) + 30 hari pematangan buah.
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border-slate-300 text-slate-700 font-semibold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting || blocks.length === 0}
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
            >
              {isSubmitting ? 'Memproses...' : 'Mulai Siklus'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
