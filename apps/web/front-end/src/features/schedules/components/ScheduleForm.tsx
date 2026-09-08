import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Save, ChevronDown, SunMedium, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AVAILABLE_NODES } from '@/data/mockScheduleNodes';
import { scheduleFormSchema } from '../schemas/scheduleSchema';
import type { ScheduleFormInput } from '../schemas/scheduleSchema';

interface ScheduleFormProps {
  initialData?: ScheduleFormInput;
  isEditMode?: boolean;
  onSubmit: (data: ScheduleFormInput) => void;
  isSubmitting?: boolean;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  initialData,
  isEditMode = false,
  onSubmit,
  isSubmitting = false,
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ScheduleFormInput>(
    initialData || {
      nodeId: '',
      location: '',
      startTime: '18:00',
      endTime: '05:00',
      intensity: 80,
      description: '',
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof ScheduleFormInput, string>>>({});

  const handleNodeChange = (selectedCode: string) => {
    const foundNode = AVAILABLE_NODES.find((node) => node.code === selectedCode);
    setFormData((prev) => ({
      ...prev,
      nodeId: selectedCode,
      location: foundNode ? foundNode.location : '',
    }));
    if (errors.nodeId) setErrors((prev) => ({ ...prev, nodeId: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = scheduleFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ScheduleFormInput, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field) fieldErrors[field as keyof ScheduleFormInput] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Node ID */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Node ID <span className="text-rose-600 font-bold">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.nodeId}
                onChange={(e) => handleNodeChange(e.target.value)}
                className={`w-full appearance-none bg-white border ${
                  errors.nodeId ? 'border-rose-500' : 'border-slate-300 focus:border-emerald-600'
                } rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer shadow-2xs`}
              >
                <option value="" disabled>Pilih Node ID</option>
                {AVAILABLE_NODES.map((node) => (
                  <option key={node.id} value={node.code}>
                    {node.code} ({node.status})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.nodeId && <p className="text-xs text-rose-600 font-medium">{errors.nodeId}</p>}
          </div>

          {/* Lokasi */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">Lokasi Kebun & Blok</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                value={formData.location}
                placeholder="Pilih Node ID terlebih dahulu..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 cursor-not-allowed outline-none"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Jam Mulai & Akhir */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Waktu Mulai Nyala <span className="text-rose-600 font-bold">*</span>
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs"
              />
            </div>
            {errors.startTime && <p className="text-xs text-rose-600 font-medium">{errors.startTime}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Waktu Akhir Nyala <span className="text-rose-600 font-bold">*</span>
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs"
              />
            </div>
            {errors.endTime && <p className="text-xs text-rose-600 font-medium">{errors.endTime}</p>}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Intensitas */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-slate-800">
              Intensitas Cahaya Target <span className="text-rose-600 font-bold">*</span>
            </label>
            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-600/30 px-3 py-1 rounded-full shadow-2xs">
              {formData.intensity}%
            </span>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <Lightbulb className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.intensity}
              onChange={(e) => setFormData((prev) => ({ ...prev, intensity: Number(e.target.value) }))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
            />
            <SunMedium className="w-5 h-5 text-amber-500 shrink-0" />
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Keterangan */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-800">
            Keterangan <span className="text-xs font-normal text-slate-500">(Opsional)</span>
          </label>
          <textarea
            rows={3}
            value={formData.description || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Tambahkan instruksi khusus untuk siklus pencahayaan ini..."
            className="w-full rounded-xl p-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors"
          />
        </div>
      </div>

      <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col-reverse sm:flex-row justify-end items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => navigate('/admin/schedules')}
          className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-white font-semibold"
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting}
          className="w-full sm:w-auto flex flex-row items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
        >
          <Save className="w-4 h-4 shrink-0" />
          <span>{isSubmitting ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Simpan Jadwal'}</span>
        </Button>
      </div>
    </form>
  );
};
