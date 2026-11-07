import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Save,
  ChevronDown,
  SunMedium,
  Lightbulb,
  Building2,
  Cpu,
  Info,
  Sliders,
  Gauge,
  Zap,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { scheduleService, normalizeTo24HourTime } from '@/services/scheduleService';
import { farmService } from '@/services/farmService';
import { scheduleFormSchema } from '../schemas/scheduleSchema';
import type { ScheduleFormInput } from '../schemas/scheduleSchema';
import type { Farm } from '@/types/farm.types';

interface ScheduleFormProps {
  initialData?: ScheduleFormInput;
  isEditMode?: boolean;
  onSubmit: (data: ScheduleFormInput) => void;
  isSubmitting?: boolean;
  externalErrors?: Record<string, string>;
  isScopeReadOnly?: boolean;
  isNodeReadOnly?: boolean;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  initialData,
  isEditMode = false,
  onSubmit,
  isSubmitting = false,
  externalErrors = {},
  isScopeReadOnly = false,
  isNodeReadOnly = false,
}) => {
  const navigate = useNavigate();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [nodes, setNodes] = useState<
    Array<{
      id: string;
      code: string;
      location: string;
      status: string;
      farmId: string;
      blockId?: string;
      blockName?: string;
    }>
  >([]);

  const [formData, setFormData] = useState<ScheduleFormInput>(() => {
    if (initialData) return initialData;
    return {
      scope: 'kebun',
      farmId: '',
      nodeId: '',
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      farmService.getAll().catch(() => []),
      scheduleService.getAvailableNodesForSchedule().catch(() => []),
    ]).then(([farmList, nodeList]) => {
      if (isMounted) {
        setFarms(farmList);
        setNodes(nodeList);

        // Sinkronisasi jika nodeId di formData adalah ID sensor (UUID) atau kode perangkat
        setFormData((prev) => {
          let updatedNodeId = prev.nodeId;
          let updatedLocation = prev.location;
          let updatedFarmId = prev.farmId;

          if (prev.nodeId) {
            const matchedNode = nodeList.find(
              (n) => n.id === prev.nodeId || n.code === prev.nodeId
            );
            if (matchedNode) {
              updatedNodeId = matchedNode.code;
              updatedLocation = matchedNode.location;
              if (matchedNode.farmId && !prev.farmId) {
                updatedFarmId = matchedNode.farmId;
              }
            }
          } else if (prev.farmId) {
            const matchedFarm = farmList.find((f) => f.id === prev.farmId);
            if (matchedFarm && (!prev.location || prev.scope === 'kebun')) {
              updatedLocation = matchedFarm.name;
            }
          }

          if (
            updatedNodeId !== prev.nodeId ||
            updatedLocation !== prev.location ||
            updatedFarmId !== prev.farmId
          ) {
            return {
              ...prev,
              nodeId: updatedNodeId,
              location: updatedLocation,
              farmId: updatedFarmId,
            };
          }
          return prev;
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync external errors from backend (e.g. 422)
  useEffect(() => {
    if (externalErrors && Object.keys(externalErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...externalErrors }));
    }
  }, [externalErrors]);

  // Update formData when initialData changes (e.g. after async fetch in edit page or query params)
  useEffect(() => {
    if (initialData) {
      let resolvedNodeId = initialData.nodeId;
      let resolvedLocation = initialData.location;
      let resolvedFarmId = initialData.farmId;

      if (nodes.length > 0 && initialData.nodeId) {
        const matched = nodes.find(
          (n) => n.id === initialData.nodeId || n.code === initialData.nodeId
        );
        if (matched) {
          resolvedNodeId = matched.code;
          resolvedLocation = matched.location;
          if (matched.farmId && !initialData.farmId) {
            resolvedFarmId = matched.farmId;
          }
        }
      }

      if (farms.length > 0 && resolvedFarmId && (!resolvedLocation || initialData.scope === 'kebun')) {
        const matchedFarm = farms.find((f) => f.id === resolvedFarmId);
        if (matchedFarm) {
          resolvedLocation = matchedFarm.name;
        }
      }

      setFormData({
        ...initialData,
        nodeId: resolvedNodeId,
        location: resolvedLocation,
        farmId: resolvedFarmId,
      });
    }
  }, [initialData, nodes, farms]);

  // Auto-select first farm if scope is kebun and no farmId selected
  useEffect(() => {
    if (!isEditMode && formData.scope === 'kebun' && !formData.farmId && farms.length > 0) {
      setFormData((prev) => ({
        ...prev,
        farmId: farms[0].id,
        location: farms[0].name,
      }));
    }
  }, [formData.scope, formData.farmId, farms, isEditMode]);

  const handleScopeChange = (newScope: 'kebun' | 'node') => {
    if (isEditMode || isScopeReadOnly) return;

    setFormData((prev) => ({
      ...prev,
      scope: newScope,
      farmId: newScope === 'kebun' ? (farms[0]?.id || '') : '',
      nodeId: newScope === 'node' ? (nodes[0]?.code || '') : '',
      location: newScope === 'kebun' ? (farms[0]?.name || '') : (nodes[0]?.location || ''),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.farmId;
      delete next.nodeId;
      delete next.scope;
      return next;
    });
  };

  const handleModeChange = (newMode: 'manual' | 'auto') => {
    setFormData((prev) => {
      if (newMode === 'manual') {
        return {
          ...prev,
          mode: 'manual',
          intensity: prev.intensity ?? 80,
          // Kosongkan field mode auto
          targetLux: undefined,
          minIntensity: undefined,
          baselineManualPersen: undefined,
        };
      }
      return {
        ...prev,
        mode: 'auto',
        // Kosongkan field mode manual
        intensity: undefined,
        targetLux: prev.targetLux ?? 150,
        minIntensity: prev.minIntensity ?? 10,
        baselineManualPersen: prev.baselineManualPersen ?? 70,
      };
    });

    setErrors((prev) => {
      const next = { ...prev };
      delete next.mode;
      delete next.intensity;
      delete next.instensitas_cahaya;
      delete next.targetLux;
      delete next.target_lux;
      delete next.minIntensity;
      delete next.intensitas_minimum;
      delete next.baselineManualPersen;
      delete next.baseline_manual_persen;
      return next;
    });
  };

  const handleFarmChange = (selectedFarmId: string) => {
    const foundFarm = farms.find((f) => f.id === selectedFarmId);
    setFormData((prev) => ({
      ...prev,
      farmId: selectedFarmId,
      location: foundFarm?.name || '',
    }));
    if (errors.farmId || errors.kebun_id) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.farmId;
        delete next.kebun_id;
        return next;
      });
    }
  };

  const handleNodeChange = (selectedCode: string) => {
    const foundNode = nodes.find((node) => node.code === selectedCode || node.id === selectedCode);
    setFormData((prev) => ({
      ...prev,
      nodeId: foundNode?.code || selectedCode,
      location: foundNode ? foundNode.location : '',
    }));
    if (errors.nodeId || errors.sensor_id) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.nodeId;
        delete next.sensor_id;
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedData: ScheduleFormInput = {
      ...formData,
      startTime: normalizeTo24HourTime(formData.startTime, '18:00'),
      endTime: normalizeTo24HourTime(formData.endTime, '05:00'),
    };

    const result = scheduleFormSchema.safeParse(normalizedData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = String(issue.path[0] || 'form');
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      <div className="p-6 md:p-8 space-y-6">
        {/* Pilihan Cakupan Jadwal (Scope) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-slate-800">
              Cakupan Jadwal <span className="text-rose-600 font-bold">*</span>
            </label>
            {(isEditMode || isScopeReadOnly) && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                <Lock className="w-3 h-3 text-slate-400" />
                {isEditMode ? 'Cakupan Tidak Dapat Diubah Saat Edit' : 'Cakupan Terkunci'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isEditMode || isScopeReadOnly}
              onClick={() => handleScopeChange('kebun')}
              className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                isEditMode || isScopeReadOnly ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'
              } ${
                formData.scope === 'kebun'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  formData.scope === 'kebun' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
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
              disabled={isEditMode || isScopeReadOnly}
              onClick={() => handleScopeChange('node')}
              className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                isEditMode || isScopeReadOnly ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'
              } ${
                formData.scope === 'node'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  formData.scope === 'node' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
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
          {(errors.scope || errors.kebun_id || errors.sensor_id) && (
            <p className="text-xs text-rose-600 font-medium">
              {errors.scope || errors.kebun_id || errors.sensor_id}
            </p>
          )}
        </div>

        {/* Dropdown Kebun / Node */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {formData.scope === 'kebun' ? (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                Pilih Kebun <span className="text-rose-600 font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  disabled={isEditMode}
                  value={formData.farmId || ''}
                  onChange={(e) => handleFarmChange(e.target.value)}
                  className={`w-full appearance-none bg-white border ${
                    errors.farmId ? 'border-rose-500' : 'border-slate-300 focus:border-emerald-600'
                  } ${
                    isEditMode ? 'bg-slate-50 cursor-not-allowed' : 'cursor-pointer'
                  } rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs pr-10`}
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
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-800">
                  Pilih Node Target <span className="text-rose-600 font-bold">*</span>
                </label>
                {isNodeReadOnly && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    <Lock className="w-3 h-3 text-slate-400" />
                    Node Terkunci
                  </span>
                )}
              </div>
              <div className="relative">
                <select
                  disabled={isEditMode || isNodeReadOnly}
                  value={formData.nodeId || ''}
                  onChange={(e) => handleNodeChange(e.target.value)}
                  className={`w-full appearance-none bg-white border ${
                    errors.nodeId ? 'border-rose-500' : 'border-slate-300 focus:border-emerald-600'
                  } ${
                    isEditMode || isNodeReadOnly ? 'bg-slate-50 cursor-not-allowed' : 'cursor-pointer'
                  } rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs pr-10`}
                >
                  <option value="" disabled>Pilih Node Sensor</option>
                  {nodes.map((node) => {
                    const blockPrefix = node.blockName ? `${node.blockName} - ` : '';
                    return (
                      <option key={node.id || node.code} value={node.code}>
                        {blockPrefix}{node.code} ({node.status})
                      </option>
                    );
                  })}
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
                  step="60"
                  value={normalizeTo24HourTime(formData.startTime, '18:00')}
                  onChange={(e) => {
                    const cleanVal = normalizeTo24HourTime(e.target.value, e.target.value);
                    setFormData((prev) => ({ ...prev, startTime: cleanVal }));
                    if (errors.startTime || errors.jam_mulai_nyala) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.startTime;
                        delete next.jam_mulai_nyala;
                        return next;
                      });
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
                    errors.startTime || errors.jam_mulai_nyala
                      ? 'border-rose-500'
                      : 'border-slate-300 focus:border-emerald-600'
                  } focus:ring-1 focus:ring-emerald-600 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs`}
                />
              </div>
              {(errors.startTime || errors.jam_mulai_nyala) && (
                <p className="text-xs text-rose-600 font-medium">{errors.startTime || errors.jam_mulai_nyala}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                Waktu Akhir Nyala <span className="text-rose-600 font-bold">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="time"
                  step="60"
                  value={normalizeTo24HourTime(formData.endTime, '05:00')}
                  onChange={(e) => {
                    const cleanVal = normalizeTo24HourTime(e.target.value, e.target.value);
                    setFormData((prev) => ({ ...prev, endTime: cleanVal }));
                    if (errors.endTime || errors.jam_akhir_nyala) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.endTime;
                        delete next.jam_akhir_nyala;
                        return next;
                      });
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
                    errors.endTime || errors.jam_akhir_nyala
                      ? 'border-rose-500'
                      : 'border-slate-300 focus:border-emerald-600'
                  } focus:ring-1 focus:ring-emerald-600 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs`}
                />
              </div>
              {(errors.endTime || errors.jam_akhir_nyala) && (
                <p className="text-xs text-rose-600 font-medium">{errors.endTime || errors.jam_akhir_nyala}</p>
              )}
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

        {/* PEMILIH MODE (Manual vs Auto-dimming) */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-800">
            Mode Penyinaran Lampu <span className="text-rose-600 font-bold">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleModeChange('manual')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                formData.mode === 'manual'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  formData.mode === 'manual' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Sliders className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-bold ${formData.mode === 'manual' ? 'text-emerald-950' : 'text-slate-900'}`}>
                    Manual
                  </p>
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 ${
                      formData.mode === 'manual' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'
                    }`}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Kecerahan lampu tetap selama jam nyala.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('auto')}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                formData.mode === 'auto'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  formData.mode === 'auto' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Zap className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-bold ${formData.mode === 'auto' ? 'text-emerald-950' : 'text-slate-900'}`}>
                    Auto-dimming
                  </p>
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 ${
                      formData.mode === 'auto' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'
                    }`}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Kecerahan menyesuaikan cahaya sekitar secara otomatis.
                </p>
              </div>
            </button>
          </div>
          {errors.mode && <p className="text-xs text-rose-600 font-medium">{errors.mode}</p>}
        </div>

        {/* FIELD BERDASARKAN MODE */}
        {formData.mode === 'manual' ? (
          /* MODE MANUAL: Slider Kecerahan Lampu */
          <div className="space-y-3 p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl">
            <div className="flex justify-between items-center">
              <div>
                <label className="block text-sm font-semibold text-slate-800">
                  Kecerahan Lampu <span className="text-rose-600 font-bold">*</span>
                </label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tingkat output daya lampu konstan sepanjang jendela operasional nyala.
                </p>
              </div>
              <span className="text-sm font-bold text-emerald-800 bg-white border border-emerald-600/30 px-3 py-1 rounded-full shadow-2xs">
                {formData.intensity ?? 80}%
              </span>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <Lightbulb className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.intensity ?? 80}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData((prev) => ({ ...prev, intensity: val }));
                  if (errors.intensity || errors.instensitas_cahaya) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.intensity;
                      delete next.instensitas_cahaya;
                      return next;
                    });
                  }
                }}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
              />
              <SunMedium className="w-5 h-5 text-slate-500 shrink-0" />
            </div>
            {(errors.intensity || errors.instensitas_cahaya) && (
              <p className="text-xs text-rose-600 font-medium">{errors.intensity || errors.instensitas_cahaya}</p>
            )}
          </div>
        ) : (
          /* MODE AUTO-DIMMING: Target Lux, Kecerahan Minimum, Baseline Manual */
          <div className="space-y-5 p-4.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl">
            {/* 1. Target Lux */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-slate-800">
                  Target Lux <span className="text-rose-600 font-bold">*</span>
                </label>
                <span className="text-xs font-semibold text-emerald-800 bg-white border border-emerald-600/20 px-2 py-0.5 rounded-md">
                  Satuan Lux
                </span>
              </div>
              <div className="relative">
                <Gauge className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={formData.targetLux ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? undefined : Number(e.target.value);
                    setFormData((prev) => ({ ...prev, targetLux: val }));
                    if (errors.targetLux || errors.target_lux) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.targetLux;
                        delete next.target_lux;
                        return next;
                      });
                    }
                  }}
                  placeholder="Contoh: 150"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border ${
                    errors.targetLux || errors.target_lux
                      ? 'border-rose-500'
                      : 'border-slate-300 focus:border-emerald-600'
                  } focus:ring-1 focus:ring-emerald-600 rounded-xl text-sm font-medium text-slate-900 outline-none shadow-2xs`}
                />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Lampu meredup saat cahaya sekitar mendekati nilai ini. Acuan umum 110-220 lux.
              </p>
              {(errors.targetLux || errors.target_lux) && (
                <p className="text-xs text-rose-600 font-medium">{errors.targetLux || errors.target_lux}</p>
              )}
            </div>

            {/* 2. Slider Kecerahan Minimum */}
            <div className="space-y-2 pt-2 border-t border-emerald-100/60">
              <div className="flex justify-between items-center">
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    Kecerahan Minimum
                  </label>
                  <p className="text-xs text-slate-500">
                    Lampu tidak akan lebih redup dari nilai ini.
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-800 bg-white border border-emerald-600/30 px-3 py-1 rounded-full shadow-2xs">
                  {formData.minIntensity ?? 10}%
                </span>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <Lightbulb className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.minIntensity ?? 10}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData((prev) => ({ ...prev, minIntensity: val }));
                    if (errors.minIntensity || errors.intensitas_minimum) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.minIntensity;
                        delete next.intensitas_minimum;
                        return next;
                      });
                    }
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                />
                <SunMedium className="w-5 h-5 text-slate-500 shrink-0" />
              </div>
              {(errors.minIntensity || errors.intensitas_minimum) && (
                <p className="text-xs text-rose-600 font-medium">{errors.minIntensity || errors.intensitas_minimum}</p>
              )}
            </div>

            {/* 3. Slider Kecerahan Pembanding (Manual Biasa) */}
            <div className="space-y-2 pt-2 border-t border-emerald-100/60">
              <div className="flex justify-between items-center">
                <div>
                  <label className="block text-sm font-semibold text-slate-800">
                    Kecerahan Pembanding (Manual Biasa) <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <p className="text-xs text-slate-500">
                    Dipakai untuk menghitung estimasi listrik yang dihemat.
                  </p>
                </div>
                <span className="text-sm font-bold text-emerald-800 bg-white border border-emerald-600/30 px-3 py-1 rounded-full shadow-2xs">
                  {formData.baselineManualPersen ?? 70}%
                </span>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <Zap className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.baselineManualPersen ?? 70}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData((prev) => ({ ...prev, baselineManualPersen: val }));
                    if (errors.baselineManualPersen || errors.baseline_manual_persen) {
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.baselineManualPersen;
                        delete next.baseline_manual_persen;
                        return next;
                      });
                    }
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
                />
                <SunMedium className="w-5 h-5 text-slate-500 shrink-0" />
              </div>
              {(errors.baselineManualPersen || errors.baseline_manual_persen) && (
                <p className="text-xs text-rose-600 font-medium">
                  {errors.baselineManualPersen || errors.baseline_manual_persen}
                </p>
              )}
            </div>
          </div>
        )}

        <hr className="border-slate-100" />

        {/* Status Aktif Toggle (Hanya untuk Edit Mode) */}
        {isEditMode && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <label htmlFor="status_aktif_toggle" className="text-sm font-bold text-slate-900 block cursor-pointer">
                Status Jadwal
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                {formData.statusAktif
                  ? 'Jadwal sedang aktif dan beroperasi sesuai jadwal waktu.'
                  : 'Jadwal dinonaktifkan sementara tanpa menghapus konfigurasi.'}
              </p>
            </div>
            <button
              id="status_aktif_toggle"
              type="button"
              role="switch"
              aria-checked={formData.statusAktif}
              onClick={() => setFormData((prev) => ({ ...prev, statusAktif: !prev.statusAktif }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 ${
                formData.statusAktif ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.statusAktif ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

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
            className="w-full rounded-xl p-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none transition-colors shadow-2xs"
          />
          {errors.description && <p className="text-xs text-rose-600 font-medium">{errors.description}</p>}
        </div>

        {/* Kotak Info Penggantian Otomatis di atas tombol simpan */}
        <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-bold text-slate-900">Perhatian:</span> Jadwal aktif sebelumnya di cakupan ini akan otomatis digantikan.
          </p>
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
