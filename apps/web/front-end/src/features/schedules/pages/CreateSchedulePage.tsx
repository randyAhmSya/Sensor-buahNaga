import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { scheduleService } from '@/services/scheduleService';
import { ScheduleForm } from '../components/ScheduleForm';
import type { ScheduleFormInput } from '../schemas/scheduleSchema';

export const CreateSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreate = async (data: ScheduleFormInput) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (data.scope === 'kebun') {
        await scheduleService.create({
          nama_jadwal: data.description?.trim() || `Jadwal Kebun ${data.location || ''}`.trim(),
          mode: 'manual',
          kebun_id: data.farmId || undefined,
          sensor_id: undefined,
          jam_mulai: data.startTime,
          jam_selesai: data.endTime,
          status_aktif: true,
          instensitas_cahaya: data.intensity,
        });
      } else {
        const nodes = await scheduleService.getAvailableNodesForSchedule().catch(() => []);
        const matchedNode = nodes.find((n) => n.code === data.nodeId || n.id === data.nodeId);

        await scheduleService.create({
          nama_jadwal: data.description?.trim() || `Jadwal Lampu Node ${data.nodeId}`,
          mode: 'manual',
          sensor_id: matchedNode?.id || undefined,
          kebun_id: undefined,
          jam_mulai: data.startTime,
          jam_selesai: data.endTime,
          status_aktif: true,
          instensitas_cahaya: data.intensity,
        });
      }

      navigate('/kebun/schedules');
    } catch (err: unknown) {
      setErrorMessage((err as Error)?.message || 'Gagal menyimpan jadwal lampu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumbs & Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/kebun/schedules" className="hover:text-emerald-700 transition-colors">
            Jadwal Lampu
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Tambah Jadwal</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Tambah Jadwal Lampu
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Atur otomatisasi penyinaran lampu LED untuk node tertentu di area kebun.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate('/kebun/schedules')}
            className="flex flex-row items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Kembali ke Jadwal</span>
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <ScheduleForm
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CreateSchedulePage;
