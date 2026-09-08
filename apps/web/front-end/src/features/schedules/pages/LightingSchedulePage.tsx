import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getDimmingLogs } from '@/data/mockSchedules';
import type { ActiveScheduleItem } from '@/data/mockSchedules';
import { scheduleService } from '@/services/api';
import { ActiveSchedulesTable } from '../components/ActiveSchedulesTable';
import { DimmingLogsTable } from '../components/DimmingLogsTable';
import { DeleteScheduleModal } from '../components/DeleteScheduleModal';

export const LightingSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<ActiveScheduleItem[]>([]);
  const dimmingLogs = getDimmingLogs();

  // State untuk modal hapus
  const [selectedScheduleToDelete, setSelectedScheduleToDelete] = useState<ActiveScheduleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    scheduleService.getAll().then((data) => {
      if (isMounted) {
        setSchedules(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleEdit = (schedule: ActiveScheduleItem) => {
    navigate(`/admin/schedules/${schedule.id}/edit`);
  };

  const handleDeleteClick = (schedule: ActiveScheduleItem) => {
    setSelectedScheduleToDelete(schedule);
  };

  const handleConfirmDelete = async (id: string) => {
    setIsDeleting(true);
    await scheduleService.delete(id);
    setSchedules((prev) => prev.filter((item) => item.id !== id));
    setIsDeleting(false);
    setSelectedScheduleToDelete(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Jadwal Lampu</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Kelola dan pantau siklus pencahayaan cerdas serta efisiensi auto-dimming sensor.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => navigate('/admin/schedules/new')}
          className="flex flex-row items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Tambah Jadwal</span>
        </Button>
      </div>

      <ActiveSchedulesTable
        schedules={schedules}
        onEdit={handleEdit}
        onDelete={(id) => {
          const item = schedules.find((s) => s.id === id);
          if (item) handleDeleteClick(item);
        }}
      />

      <DimmingLogsTable logs={dimmingLogs} />

      {/* Modal Konfirmasi Hapus */}
      <DeleteScheduleModal
        isOpen={Boolean(selectedScheduleToDelete)}
        schedule={selectedScheduleToDelete}
        onClose={() => setSelectedScheduleToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default LightingSchedulePage;
