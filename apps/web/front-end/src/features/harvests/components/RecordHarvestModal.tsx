import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { harvestService } from '@/services/harvestService';
import type { HarvestCycle } from '../types/harvest.types';

interface RecordHarvestModalProps {
  isOpen: boolean;
  cycle: HarvestCycle | null;
  onClose: () => void;
  onSuccess: (updatedCycle: HarvestCycle) => void;
}

export const RecordHarvestModal: React.FC<RecordHarvestModalProps> = ({
  isOpen,
  cycle,
  onClose,
  onSuccess,
}) => {
  const [harvestDate, setHarvestDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (cycle && isOpen) {
      setHarvestDate(
        cycle.tanggal_panen ||
        cycle.estimasi_tanggal_panen ||
        new Date().toISOString().split('T')[0]
      );
      setErrorMsg(null);
      setIsSubmitting(false);
    }
  }, [cycle, isOpen]);

  if (!isOpen || !cycle) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!harvestDate) {
      setErrorMsg('Tanggal panen nyata wajib diisi');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const updated = await harvestService.recordHarvest(cycle.id_siklus_panen, {
        tanggal_panen: harvestDate,
      });

      const enriched: HarvestCycle = {
        ...updated,
        status_siklus: 'SELESAI', // Backend otomatis mengubah status ke SELESAI
        blockName: updated.blockName || cycle.blockName,
        farmName: updated.farmName || cycle.farmName,
      };

      onSuccess(enriched);
      onClose();
    } catch (err: unknown) {
      setErrorMsg((err as Error)?.message || 'Gagal mencatat panen dan menyelesaikan siklus');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Catat Panen Nyata</h3>
              <p className="text-xs text-slate-500">Selesaikan siklus panen dan catat tanggal panen aktual.</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Info Siklus Terpilih */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-900 text-sm">
              {cycle.blockName} <span className="font-normal text-slate-500">({cycle.farmName})</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span>Estimasi Tanggal Panen:</span>
              <span className="font-semibold text-slate-800">{cycle.estimasi_tanggal_panen}</span>
            </div>
            {cycle.tanggal_berbunga_aktual && (
              <div className="flex items-center justify-between">
                <span>Bunga Aktual:</span>
                <span className="font-semibold text-amber-700">{cycle.tanggal_berbunga_aktual}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Tanggal Panen Nyata <span className="text-rose-600 font-bold">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none shadow-2xs"
              />
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Menyimpan tanggal panen akan secara otomatis mengubah status siklus panen dari <strong>BERJALAN</strong> menjadi <strong>SELESAI</strong> di sistem backend.
            </p>
          </div>

          <div className="pt-3 flex gap-3">
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
              disabled={isSubmitting}
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
            >
              {isSubmitting ? 'Menyimpan...' : 'Selesaikan Panen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
