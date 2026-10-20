import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Save, ChevronDown, SunMedium, Lightbulb, Building2, Cpu, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { scheduleService } from '@/services/scheduleService';
import { farmService } from '@/services/farmService';
import { scheduleFormSchema } from '../schemas/scheduleSchema';
import type { ScheduleFormInput } from '../schemas/scheduleSchema';
import type { Farm } from '@/types/farm.types';

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

  const [farms, setFarms] = useState<Farm[]>([]);
  const [nodes, setNodes] = useState<
    Array<{ id: string; code: string; location: string; status: string; farmId?: string }>
  >([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      farmService.getAll().catch(() => []),
      scheduleService.getAvailableNodesForSchedule().catch(() => []),
    ]).then(([farmList, nodeList]) => {
      if (isMounted) {
        setFarms(farmList);
        setNodes(nodeList);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const [formData, setFormData] = useState<ScheduleFormInput>(
    initialData || {
      scope: 'kebun',
      farmId: '',
      nodeId: '',
      location: '',
      startTime: '18:00',
      endTime: '05:00',
      intensity: 80,
      description: '',
    }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof ScheduleFormInput, string>>>({});

  // Auto-select first farm if scope is kebun and no farmId selected
  useEffect(() => {
    if (formData.scope === 'kebun' && !formData.farmId && farms.length > 0) {
      setFormData((prev) => ({
        ...prev,
        farmId: farms[0].id,
        location: farms[0].name,
      }));
    }
  }, [formData.scope, formData.farmId, farms]);

  const handleScopeChange = (newScope: 'kebun' | 'node') => {
    setFormData((prev) => ({
      ...prev,
      scope: newScope,
      farmId: newScope === 'kebun' ? (farms[0]?.id || '') : '',
      nodeId: newScope === 'node' ? (nodes[0]?.code || '') : '',
      location: newScope === 'kebun' ? (farms[0]?.name || '') : (nodes[0]?.location || ''),
    }));
    setErrors({});
  };

  const handleFarmChange = (selectedFarmId: string) => {
    const foundFarm = farms.find((f) => f.id === selectedFarmId);
    setFormData((prev) => ({
      ...prev,
      farmId: selectedFarmId,
      location: foundFarm?.name || '',
    }));
    if (errors.farmId) setErrors((prev) => ({ ...prev, farmId: undefined }));
  };

  const handleNodeChange = (selectedCode: string) => {
    const foundNode = nodes.find((node) => node.code === selectedCode || node.id === selectedCode);
    setFormData((prev) => ({
      ...prev,
      nodeId: foundNode?.code || selectedCode,
      location: foundNode ? foundNode.location : '',
    }));
    if (errors.nodeId) setErrors((prev) => ({ ...prev, nodeId: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.scope === 'kebun' && !formData.farmId) {
      setErrors({ farmId: 'Pilih kebun terlebih dahulu' });
      return;
    }
    if (formData.scope === 'node' && !formData.nodeId) {
      setErrors({ nodeId: 'Pilih node terlebih dahulu' });
      return;
    }

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
        {/* Pilihan Cakupan Jadwal (Scope) */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">
            Cakupan Jadwal <span className="text-rose-600 font-bold">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleScopeChange('kebun')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                formData.scope === 'kebun'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${formData.scope === 'kebun' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-sm font-bold ${formData.scope === 'kebun' ? 'text-emerald-950' : 'text-slate-900'}`}>
                  Per Kebun (Default)
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menerapkan jadwal penyinaran seragam untuk seluruh node dalam satu kebun.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleScopeChange('node')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                formData.scope === 'node'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${formData.scope === 'node' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className={`text-sm font-bold ${formData.scope === 'node' ? 'text-emerald-950' : 'text-slate-900'}`}>
                  Per Node (Override)
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menetapkan aturan penyinaran khusus untuk satu tiang node tertentu.
                </p>
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formData.scope === 'kebun' ? (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                Pilih Kebun <span className="text-rose-600 font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.farmId || ''}
                  onChange={(e) => handleFarmChange(e.target.value)}
                  className={`w-full appearance-none bg-white border ${
                    errors.farmId ? 'border-rose-500' : 'border-slate-300 focus:border-emerald-600'
                  } rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer shadow-2xs pr-10`}
                >
                  <option value="" disabled>Pilih Kebun Terdaftar</option>
                  {farms.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name} {farm.location ? `(${farm.location})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.farmId && <p className="text-xs text-rose-600 font-medium">{errors.farmId}</p>}
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                Pilih Node ID <span className="text-rose-600 font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.nodeId || ''}
                  onChange={(e) => handleNodeChange(e.target.value)}
                  className={`w-full appearance-none bg-white border ${
                    errors.nodeId ? 'border-rose-500' : 'border-slate-300 focus:border-emerald-600'
                  } rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer shadow-2xs pr-10`}
                >
                  <option value="" disabled>Pilih Node Sensor</option>
                  {nodes.map((node) => (
                    <option key={node.id || node.code} value={node.code}>
                      {node.code} ({node.status})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {errors.nodeId && <p className="text-xs text-rose-600 font-medium">{errors.nodeId}</p>}
            </div>
          )}

          {/* Lokasi Terpilih */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">Lokasi Terhubung</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                value={formData.location || ''}
                placeholder="Lokasi otomatis terdeteksi..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 cursor-not-allowed outline-none"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Jam Mulai & Akhir dengan Dukungan Lintas Tengah Malam */}
        <div className="space-y-3">
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

          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Mendukung rentang waktu lintas tengah malam: misal mulai pukul 18:00 dan berakhir pukul 05:00 pagi berikutnya.
            </span>
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
            <SunMedium className="w-5 h-5 text-slate-500 shrink-0" />
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
          onClick={() => navigate('/kebun/schedules')}
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
