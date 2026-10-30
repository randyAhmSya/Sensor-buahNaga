import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { scheduleService, normalizeTo24HourTime, type UpdateJadwalLampuPayload } from '@/services/scheduleService';
import { scheduleKeys } from '@/services/queryKeys';
import { ApiError } from '@/services/api';
import { useNotify } from '@/context/NotificationContext';
import { ScheduleForm } from '../components/ScheduleForm';
import type { ScheduleFormInput } from '../schemas/scheduleSchema';

export const EditSchedulePage: React.FC = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notify = useNotify();

  const [initialValues, setInitialValues] = useState<ScheduleFormInput | null>(null);
  const [originalValues, setOriginalValues] = useState<ScheduleFormInput | null>(null);
  const [scheduleName, setScheduleName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    if (!scheduleId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const detail = await scheduleService.getById(scheduleId);
        if (detail && isMounted) {
          const isNodeScope = Boolean(detail.sensor_id);
          const rawStart = detail.jam_mulai_nyala || detail.jam_mulai || '18:00';
          const rawEnd = detail.jam_akhir_nyala || detail.jam_selesai || '05:00';
          const modeVal = detail.mode || 'manual';

          const title = isNodeScope
            ? (detail.sensor?.kode_perangkat ? `Node ${detail.sensor.kode_perangkat}` : 'Node Override')
            : (detail.kebun?.nama_kebun || 'Kebun Buah Naga');
          setScheduleName(detail.keterangan || detail.nama_jadwal || title);

          const values: ScheduleFormInput = {
            scope: isNodeScope ? 'node' : 'kebun',
            farmId: detail.kebun_id || detail.kebun?.id || detail.kebun?.id_kebun || '',
            nodeId: detail.sensor?.kode_perangkat || detail.sensor_id || '',
            location: detail.kebun?.nama_kebun || 'Kebun Buah Naga',
            startTime: rawStart.substring(0, 5),
            endTime: rawEnd.substring(0, 5),
            mode: modeVal,
            intensity: detail.instensitas_cahaya ?? detail.intensitas_cahaya ?? 80,
            targetLux: detail.target_lux ?? 150,
            minIntensity: detail.intensitas_minimum ?? 10,
            baselineManualPersen: detail.baseline_manual_persen ?? 70,
            statusAktif: Boolean(detail.status_aktif ?? true),
            description: detail.keterangan || detail.nama_jadwal || '',
          };

          setInitialValues(values);
          setOriginalValues(values);
        }
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          notify.error('Gagal Memuat Jadwal', err.pesan || `Gagal memuat jadwal (Status ${err.status})`);
        } else {
          notify.error('Gagal Memuat Jadwal', (err as Error)?.message || 'Gagal memuat jadwal');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [scheduleId, notify]);

  const handleUpdate = async (data: ScheduleFormInput) => {
    if (!scheduleId || !originalValues) return;
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const payload: UpdateJadwalLampuPayload = {};
      const modeChanged = data.mode !== originalValues.mode;

      // Cek perubahan waktu nyala dengan normalisasi 24 jam
      const cleanStart = normalizeTo24HourTime(data.startTime, '18:00');
      const cleanEnd = normalizeTo24HourTime(data.endTime, '05:00');

      if (cleanStart !== originalValues.startTime) {
        payload.jam_mulai_nyala = cleanStart;
      }
      if (cleanEnd !== originalValues.endTime) {
        payload.jam_akhir_nyala = cleanEnd;
      }

      // Cek perubahan keterangan
      if ((data.description || '') !== (originalValues.description || '')) {
        payload.keterangan = data.description?.trim() || null;
      }

      // Cek perubahan status aktif
      if (data.statusAktif !== originalValues.statusAktif) {
        payload.status_aktif = data.statusAktif;
      }

      // Aturan Khusus Perubahan Mode:
      // Jika mode berubah, WAJIB kirim field wajib mode baru secara lengkap
      if (modeChanged) {
        payload.mode = data.mode;
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
      } else {
        // Mode sama, hanya kirim field mode yang berubah
        if (data.mode === 'manual') {
          if (data.intensity !== originalValues.intensity) {
            payload.instensitas_cahaya = Number(data.intensity);
          }
        } else {
          if (data.targetLux !== originalValues.targetLux) {
            payload.target_lux = Number(data.targetLux);
          }
          if (data.minIntensity !== originalValues.minIntensity) {
            payload.intensitas_minimum = Number(data.minIntensity);
          }
          if (data.baselineManualPersen !== originalValues.baselineManualPersen) {
            payload.baseline_manual_persen = Number(data.baselineManualPersen);
          }
        }
      }

      // Jika tidak ada data yang berubah
      if (Object.keys(payload).length === 0) {
        navigate('/kebun/schedules');
        return;
      }

      await scheduleService.update(scheduleId, payload);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: scheduleKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
      ]);
      notify.success('Jadwal Diperbarui', 'Perubahan konfigurasi pencahayaan berhasil disimpan.');
      navigate('/kebun/schedules');
    } catch (err: unknown) {
      console.error('Gagal memperbarui jadwal lampu:', err);
      let errorMsg = 'Gagal memperbarui jadwal lampu';
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
            else if (key === 'keterangan') formKey = 'description';
            else if (key === 'status_aktif') formKey = 'statusAktif';

            mapped[formKey] = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
          }
          setFieldErrors(mapped);
          errorMsg = err.pesan || 'Validasi formulir gagal. Silakan periksa kolom terkait.';
        } else {
          errorMsg = err.pesan || `Gagal memperbarui jadwal lampu (Status ${err.status})`;
        }
      } else {
        const anyErr = err as { response?: { data?: { pesan?: string; message?: string } }; message?: string };
        errorMsg = anyErr?.response?.data?.pesan || anyErr?.response?.data?.message || anyErr?.message || 'Gagal memperbarui jadwal lampu';
      }
      notify.error('Gagal Memperbarui Jadwal', errorMsg);
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
              Perbarui konfigurasi jendela waktu, mode penyinaran, dan parameter kecerahan.
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
          externalErrors={fieldErrors}
        />
      )}
    </div>
  );
};

export default EditSchedulePage;
