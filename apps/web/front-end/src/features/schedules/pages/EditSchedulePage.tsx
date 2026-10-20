import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { scheduleService } from '@/services/scheduleService';
import { ScheduleForm } from '../components/ScheduleForm';
import type { ScheduleFormInput } from '../schemas/scheduleSchema';

export const EditSchedulePage: React.FC = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState<ScheduleFormInput | null>(null);
  const [scheduleName, setScheduleName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!scheduleId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const detail = await scheduleService.getById(scheduleId);
        if (detail && isMounted) {
          setScheduleName(detail.nama_jadwal || detail.sensor?.kode_perangkat || 'Jadwal');
          const isNodeScope = Boolean(detail.sensor_id);
          setInitialValues({
            scope: isNodeScope ? 'node' : 'kebun',
            farmId: detail.kebun_id || detail.kebun?.id || detail.kebun?.id_kebun || '',
            nodeId: detail.sensor?.kode_perangkat || detail.sensor_id || '',
            location: detail.kebun?.nama_kebun || 'Kebun Buah Naga',
            startTime: detail.jam_mulai ? detail.jam_mulai.substring(0, 5) : '18:00',
            endTime: detail.jam_selesai ? detail.jam_selesai.substring(0, 5) : '05:00',
            intensity: detail.instensitas_cahaya ?? detail.intensitas_cahaya ?? 80,
            description: detail.nama_jadwal || '',
          });
        }
      } catch {
        // Fallback default jika gagal
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [scheduleId]);

  const handleUpdate = async (data: ScheduleFormInput) => {
    if (!scheduleId) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      if (data.scope === 'kebun') {
        await scheduleService.update(scheduleId, {
          nama_jadwal: data.description?.trim() || `Jadwal Kebun ${data.location || ''}`.trim(),
          kebun_id: data.farmId || undefined,
          sensor_id: undefined,
          jam_mulai: data.startTime,
          jam_selesai: data.endTime,
          instensitas_cahaya: data.intensity,
        });
      } else {
        const nodes = await scheduleService.getAvailableNodesForSchedule().catch(() => []);
        const matchedNode = nodes.find((n) => n.code === data.nodeId || n.id === data.nodeId);
        await scheduleService.update(scheduleId, {
          nama_jadwal: data.description?.trim() || `Jadwal Lampu Node ${data.nodeId}`,
          sensor_id: matchedNode?.id || undefined,
          kebun_id: undefined,
          jam_mulai: data.startTime,
          jam_selesai: data.endTime,
          instensitas_cahaya: data.intensity,
        });
      }
      navigate('/kebun/schedules');
    } catch (err: unknown) {
      setErrorMessage((err as Error)?.message || 'Gagal memperbarui jadwal lampu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/kebun/schedules" className="hover:text-emerald-700 transition-colors">
            Jadwal Lampu
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Edit Jadwal</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Edit Jadwal {scheduleName ? `(${scheduleName})` : ''}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Perbarui konfigurasi waktu dan intensitas lampu node operasional.
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
            <span>Kembali</span>
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">Memuat data jadwal...</p>
        </div>
      ) : (
        <ScheduleForm
          initialData={initialValues || undefined}
          isEditMode={true}
          onSubmit={handleUpdate}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default EditSchedulePage;
