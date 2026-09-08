import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getActiveSchedules } from '@/data/mockSchedules';
import { ScheduleForm } from '../components/ScheduleForm';
import type { ScheduleFormInput } from '../schemas/scheduleSchema';

export const EditSchedulePage: React.FC = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const schedules = getActiveSchedules();
  const schedule = schedules.find((s) => s.id === scheduleId) || schedules[0];

  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues: ScheduleFormInput = {
    nodeId: schedule.nodeCode,
    location: schedule.location,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    intensity: schedule.intensity,
    description: 'Siklus standar penyinaran tanaman buah naga fase generatif.',
  };

  const handleUpdate = (_data: ScheduleFormInput) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/admin/schedules');
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/admin/schedules" className="hover:text-emerald-700 transition-colors">
            Jadwal Lampu
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Edit Jadwal</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Edit Jadwal ({schedule.nodeCode})
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Perbarui konfigurasi waktu dan intensitas lampu node operasional.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate('/admin/schedules')}
            className="flex flex-row items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Kembali</span>
          </Button>
        </div>
      </div>

      <ScheduleForm
        initialData={initialValues}
        isEditMode={true}
        onSubmit={handleUpdate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default EditSchedulePage;
