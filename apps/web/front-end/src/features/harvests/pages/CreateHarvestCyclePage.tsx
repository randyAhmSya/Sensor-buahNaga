import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Save, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getAllBlockOptions } from '@/data/centralData';
import { harvestCycleFormSchema } from '../schemas/harvestSchema';
import type { HarvestCycleFormInput } from '../schemas/harvestSchema';

export const CreateHarvestCyclePage: React.FC = () => {
  const navigate = useNavigate();
  const availableBlockOptions = useMemo(() => getAllBlockOptions(), []);
  const initialOption = availableBlockOptions[0] || { farm: 'Kebun Raya Bogor', block: 'Blok A (Utara)' };

  const [formData, setFormData] = useState<HarvestCycleFormInput>({
    farmName: initialOption.farm,
    blockName: initialOption.block,
    lightingDate: '',
    bloomingTargetDays: 25,
    estimatedHarvestDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof HarvestCycleFormInput, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hitung estimasi panen otomatis berdasarkan tanggal penyinaran + target hari + durasi pembesaran buah (rata-rata 30 hari pasca berbunga)
  const calculateEstimatedHarvest = (startDateStr: string, daysToBloom: number) => {
    if (!startDateStr) return '';
    const date = new Date(startDateStr);
    if (isNaN(date.getTime())) return '';
    
    // Total hari dari penyinaran ke panen = target bunga + 30 hari pematangan
    const totalDays = Number(daysToBloom || 0) + 30;
    date.setDate(date.getDate() + totalDays);
    return date.toISOString().split('T')[0];
  };

  const handleDateOrDaysChange = (dateVal: string, daysVal: number) => {
    const est = calculateEstimatedHarvest(dateVal, daysVal);
    setFormData((prev) => ({
      ...prev,
      lightingDate: dateVal,
      bloomingTargetDays: daysVal,
      estimatedHarvestDate: est,
    }));
    if (errors.lightingDate) setErrors((prev) => ({ ...prev, lightingDate: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = harvestCycleFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof HarvestCycleFormInput, string>> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof HarvestCycleFormInput] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/admin/harvests');
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link to="/admin/harvests" className="hover:text-emerald-700 transition-colors">
            Estimasi Panen
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">Mulai Siklus Baru</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Mulai Siklus Panen Baru
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Catat permulaan siklus penyinaran lampu untuk memproyeksikan tanggal panen buah naga.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate('/admin/harvests')}
            className="flex flex-row items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Kembali</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          {/* Baris 1: Kebun & Blok */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                Pilih Kebun & Blok <span className="text-rose-600 font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  value={`${formData.farmName}|${formData.blockName}`}
                  onChange={(e) => {
                    const [farm, blk] = e.target.value.split('|');
                    setFormData((prev) => ({ ...prev, farmName: farm, blockName: blk }));
                  }}
                  className="w-full appearance-none bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none cursor-pointer shadow-2xs"
                >
                  {availableBlockOptions.map((opt) => (
                    <option key={`${opt.farm}-${opt.block}`} value={`${opt.farm}|${opt.block}`}>
                      {opt.farm} — {opt.block}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                Tanggal Mulai Penyinaran <span className="text-rose-600 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.lightingDate}
                  onChange={(e) => handleDateOrDaysChange(e.target.value, formData.bloomingTargetDays)}
                  className={`w-full bg-white border ${
                    errors.lightingDate ? 'border-rose-500' : 'border-slate-300 focus:border-emerald-600'
                  } rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none shadow-2xs`}
                />
              </div>
              {errors.lightingDate && <p className="text-xs text-rose-600 font-medium">{errors.lightingDate}</p>}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Baris 2: Target Hari Berbunga & Estimasi Panen Otomatis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                Target Hari Muncul Bunga (Hari) <span className="text-rose-600 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.bloomingTargetDays}
                  onChange={(e) => handleDateOrDaysChange(formData.lightingDate, Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none shadow-2xs"
                  placeholder="Standar: 25 hari"
                />
              </div>
              <p className="text-[11px] text-slate-400">Rata-rata induksi lampu membutuhkan waktu 20–28 hari.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                Estimasi Tanggal Panen (Kalkulasi Otomatis)
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={formData.estimatedHarvestDate || 'Pilih tanggal penyinaran terlebih dahulu'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-800 outline-none cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400">Dihitung dari induksi bunga + 30 hari pembesaran buah matang.</p>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Catatan Perlakuan */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Catatan Siklus <span className="text-xs font-normal text-slate-500">(Opsional)</span>
            </label>
            <textarea
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Catatan pemupukan kalium, target berat buah grade A, kondisi cuaca..."
              className="w-full rounded-xl p-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 border border-slate-300 focus:border-emerald-600 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Footer Tombol */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col-reverse sm:flex-row justify-end items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => navigate('/admin/harvests')}
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
            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Siklus Baru'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateHarvestCyclePage;
