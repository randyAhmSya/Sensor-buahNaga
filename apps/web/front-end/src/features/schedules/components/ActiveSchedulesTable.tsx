import React from 'react';
import { Lightbulb, Pencil, Trash2, Clock, MapPin } from 'lucide-react';
import type { ActiveScheduleItem } from '@/data/mockSchedules';
import { ResponsiveDataTable, type ColumnDef } from '@/components/ui/ResponsiveDataTable';

interface ActiveSchedulesTableProps {
  schedules: ActiveScheduleItem[];
  isLoading?: boolean;
  onEdit?: (schedule: ActiveScheduleItem) => void;
  onDelete?: (id: string) => void;
}

export const ActiveSchedulesTable: React.FC<ActiveSchedulesTableProps> = ({
  schedules,
  isLoading = false,
  onEdit,
  onDelete,
}) => {
  const columns: ColumnDef<ActiveScheduleItem>[] = [
    {
      header: 'Kode Node',
      accessorKey: 'nodeCode',
      cell: (item) => (
        <span className="font-bold text-slate-900 tracking-tight font-mono">{item.nodeCode}</span>
      ),
    },
    {
      header: 'Lokasi Kebun & Blok',
      accessorKey: 'location',
      cell: (item) => <span className="text-slate-600 font-medium">{item.location}</span>,
    },
    {
      header: 'Mulai Nyala',
      accessorKey: 'startTime',
      cell: (item) => (
        <span className="text-slate-800 font-semibold">{item.startTime}</span>
      ),
    },
    {
      header: 'Akhir Nyala',
      accessorKey: 'endTime',
      cell: (item) => <span className="text-slate-800 font-semibold">{item.endTime}</span>,
    },
    {
      header: 'Intensitas',
      className: 'text-right',
      cell: (item) => (
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-600 bg-white text-emerald-800 shadow-2xs">
          {item.intensity}%
        </span>
      ),
    },
    {
      header: 'Aksi',
      className: 'text-center',
      cell: (item) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit?.(item)}
            className="w-10 h-10 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            title="Edit Jadwal"
            aria-label={`Edit jadwal node ${item.nodeCode}`}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(item.id)}
            className="w-10 h-10 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            title="Hapus Jadwal"
            aria-label={`Hapus jadwal node ${item.nodeCode}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const renderMobileCard = (item: ActiveScheduleItem) => (
    <div
      key={item.id}
      className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 font-mono">{item.nodeCode}</h4>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{item.location}</span>
            </div>
          </div>
        </div>

        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold border border-emerald-600 bg-white text-emerald-800 shadow-2xs shrink-0">
          {item.intensity}%
        </span>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/90 flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Clock className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Jam Nyala:</span>
        </div>
        <div className="text-slate-900 font-bold">
          <span>{item.startTime}</span>
          <span className="mx-1.5 text-slate-400 font-normal">s/d</span>
          <span>{item.endTime}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit?.(item)}
          className="flex-1 min-h-[44px] px-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 hover:text-emerald-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
        >
          <Pencil className="w-3.5 h-3.5 text-slate-500" />
          <span>Edit Jadwal</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(item.id)}
          className="flex-1 min-h-[44px] px-3 rounded-xl border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          <span>Hapus</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-slate-900">Jadwal Pencahayaan Aktif</h3>
            <p className="text-xs text-slate-500">Konfigurasi waktu operasional dan intensitas lampu node</p>
          </div>
        </div>
      </div>

      <ResponsiveDataTable<ActiveScheduleItem>
        data={schedules}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        renderMobileCard={renderMobileCard}
        emptyMessage="Belum Ada Jadwal Tersimpan"
        emptySubMessage="Belum ada jadwal pencahayaan tersimpan. Klik tombol Tambah Jadwal di atas untuk membuat konfigurasi baru."
      />
    </div>
  );
};
