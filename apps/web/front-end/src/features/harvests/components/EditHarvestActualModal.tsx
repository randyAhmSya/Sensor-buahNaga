import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { HarvestCycleItem } from '@/data/mockHarvests';

interface EditHarvestActualModalProps {
  isOpen: boolean;
  cycle: HarvestCycleItem | null;
  onClose: () => void;
  onSave: (cycleId: string, actualDate: string, status: 'Berjalan' | 'Selesai') => void;
}

export const EditHarvestActualModal: React.FC<EditHarvestActualModalProps> = ({
  isOpen,
  cycle,
  onClose,
  onSave,
}) => {
  const [actualDate, setActualDate] = useState('');
  const [status, setStatus] = useState<'Berjalan' | 'Selesai'>('Selesai');

  useEffect(() => {
    if (cycle) {
      setActualDate(cycle.actualHarvestDate || new Date().toISOString().split('T')[0]);
      setStatus(cycle.status);
    }
  }, [cycle]);

  if (!isOpen || !cycle) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(cycle.id, actualDate, status);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <h3 className="text-lg font-bold text-slate-900">Perbarui Hasil Panen</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
            <div><span className="font-semibold text-slate-800">{cycle.blockName}</span> ({cycle.farmName})</div>
            <div>Estimasi Awal: <span className="font-semibold text-slate-800">{cycle.estimatedHarvestDate}</span></div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Tanggal Panen Aktual *
            </label>
            <input
              type="date"
              required
              value={actualDate}
              onChange={(e) => setActualDate(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Status Siklus *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['Berjalan', 'Selesai'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    status === st
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

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
              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
