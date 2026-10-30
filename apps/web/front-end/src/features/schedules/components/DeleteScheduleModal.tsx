import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ActiveScheduleItem } from '@/data/mockSchedules';

interface DeleteScheduleModalProps {
  isOpen: boolean;
  schedule: ActiveScheduleItem | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isDeleting?: boolean;
}

export const DeleteScheduleModal: React.FC<DeleteScheduleModalProps> = ({
  isOpen,
  schedule,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  if (!isOpen || !schedule) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl border border-slate-300 shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="p-6 pb-4 flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Konten Modal */}
        <div className="px-6 pb-6 space-y-3">
          <h3 className="text-lg font-bold text-slate-900">Hapus Jadwal Lampu?</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Apakah Anda yakin ingin menghapus jadwal untuk node{' '}
            <span className="font-bold text-slate-800">{schedule.nodeCode}</span> di{' '}
            <span className="font-semibold text-slate-800">{schedule.location}</span>?
            Aksi ini akan menonaktifkan otomatisasi pencahayaan pada node terkait.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Waktu Operasional:</span>
              <span className="font-semibold text-slate-800">{schedule.startTime} - {schedule.endTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Intensitas:</span>
              <span className="font-bold text-emerald-700">{schedule.intensity}%</span>
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-white font-semibold"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            disabled={isDeleting}
            onClick={() => onConfirm(schedule.id)}
            className="w-full sm:w-auto flex flex-row items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs"
          >
            <Trash2 className="w-4 h-4 shrink-0" />
            <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Jadwal'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
