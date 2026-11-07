import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { scheduleService, normalizeTo24HourTime, type CreateJadwalLampuPayload } from '@/services/scheduleService';
import { scheduleKeys } from '@/services/queryKeys';
import { ApiError } from '@/services/api';
import { useNotify } from '@/context/NotificationContext';
import { ScheduleForm } from '../components/ScheduleForm';
import type { ScheduleFormInput } from '../schemas/scheduleSchema';

export const CreateSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notify = useNotify();
  const [searchParams] = useSearchParams();

  // Membaca parameter query URL: scope, kebun_id, sensor_id
  const scopeParam = searchParams.get('scope');
  const kebunIdParam = searchParams.get('kebun_id');
  const sensorIdParam = searchParams.get('sensor_id');

  const initialScope: 'kebun' | 'node' = scopeParam === 'node' ? 'node' : 'kebun';
  const isScopeReadOnly = Boolean(scopeParam);
  const isNodeReadOnly = Boolean(scopeParam === 'node' && sensorIdParam);

  const initialValues = useMemo<ScheduleFormInput>(() => {
    return {
      scope: initialScope,
      farmId: kebunIdParam || '',
      nodeId: sensorIdParam || '',
      location: '',
      startTime: '18:00',
      endTime: '05:00',
      mode: 'manual',
      intensity: 80,
      targetLux: 150,
      minIntensity: 10,
      baselineManualPersen: 70,
      statusAktif: true,
      description: '',
    };
  }, [initialScope, kebunIdParam, sensorIdParam]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleCreate = async (data: ScheduleFormInput) => {
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const cleanStartTime = normalizeTo24HourTime(data.startTime, '18:00');
      const cleanEndTime = normalizeTo24HourTime(data.endTime, '05:00');

      const payload: CreateJadwalLampuPayload = {
        jam_mulai_nyala: cleanStartTime,
        jam_akhir_nyala: cleanEndTime,
        mode: data.mode,
        status_aktif: data.statusAktif ?? true,
      };

      if (data.description && data.description.trim()) {
        payload.keterangan = data.description.trim();
      }

      // Aturan skop: eksklusif
      if (data.scope === 'kebun') {
        payload.kebun_id = data.farmId?.trim();
        delete payload.sensor_id;
      } else {
        const nodes = await scheduleService.getAvailableNodesForSchedule().catch(() => []);
        const matchedNode = nodes.find((n) => n.code === data.nodeId || n.id === data.nodeId);
        payload.sensor_id = (matchedNode?.id || data.nodeId)?.trim();
        delete payload.kebun_id;
      }

      // Aturan mode: sanitasi ketat
      if (data.mode === 'manual') {
        payload.instensitas_cahaya = Number(data.intensity ?? 80);
        delete payload.target_lux;
        delete payload.intensitas_minimum;
        delete payload.baseline_manual_persen;
      } else {
        payload.target_lux = Number(data.targetLux ?? 150);
        payload.intensitas_minimum = Number(data.minIntensity ?? 10);
        payload.baseline_manual_persen = Number(data.baselineManualPersen ?? 70);
        delete payload.instensitas_cahaya;
      }

      await scheduleService.create(payload);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: scheduleKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
      ]);
      notify.success('Jadwal Lampu Dibuat', 'Konfigurasi pencahayaan berhasil diaktifkan.');
      const returnKebunId = kebunIdParam || payload.kebun_id;
      if (returnKebunId) {
        navigate(`/kebun/schedules?kebun_id=${returnKebunId}`);
      } else {
        navigate('/kebun/schedules');
      }
    } catch (err: unknown) {
      console.error('Gagal membuat jadwal lampu:', err);
      let errorMsg = 'Gagal menyimpan jadwal lampu';
      if (err instanceof ApiError) {
        if (err.status === 422 && err.errors) {
          const mapped: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(err.errors)) {
            let formKey = key;
            if (key === 'jam_mulai_nyala') formKey = 'startTime';
            else if (key === 'jam_akhir_nyala') formKey = 'endTime';
            else if (key === 'instensitas_cahaya') formKey = 'intensity';
            else if (key === 'target_lux') formKey = 'targetLux';
            else if (key === 'intensitas_minimum') formKey = 'minIntensity';
            else if (key === 'baseline_manual_persen') formKey = 'baselineManualPersen';
            else if (key === 'kebun_id') formKey = 'farmId';
            else if (key === 'sensor_id') formKey = 'nodeId';
            else if (key === 'keterangan') formKey = 'description';

            mapped[formKey] = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
          }
          setFieldErrors(mapped);
          errorMsg = err.pesan || 'Validasi formulir gagal. Silakan periksa kolom terkait.';
        } else {
          errorMsg = err.pesan || `Permintaan gagal dengan status ${err.status}`;
        }
      } else {
        const anyErr = err as { response?: { data?: { pesan?: string; message?: string } }; message?: string };
        errorMsg = anyErr?.response?.data?.pesan || anyErr?.response?.data?.message || anyErr?.message || 'Gagal menyimpan jadwal lampu';
      }
      notify.error('Gagal Menyimpan Jadwal', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const backUrl = kebunIdParam ? `/kebun/schedules?kebun_id=${kebunIdParam}` : '/kebun/schedules';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumbs & Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to={backUrl} className="hover:text-emerald-700 transition-colors">
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
              Atur siklus pencahayaan manual atau auto-dimming untuk kebun maupun node operasional.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate(backUrl)}
            className="flex flex-row items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Kembali ke Jadwal</span>
          </Button>
        </div>
      </div>

      <ScheduleForm
        initialData={initialValues}
        isScopeReadOnly={isScopeReadOnly}
        isNodeReadOnly={isNodeReadOnly}
        onSubmit={handleCreate}
        isSubmitting={isSubmitting}
        externalErrors={fieldErrors}
      />
    </div>
  );
};

export default CreateSchedulePage;
