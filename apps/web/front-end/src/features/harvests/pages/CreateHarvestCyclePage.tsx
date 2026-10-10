import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Save, ChevronDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { farmService } from '@/services/farmService';
import { harvestService } from '@/services/harvestService';
import type { BlockOptionItem } from '../components/CreateHarvestCycleModal';

export const CreateHarvestCyclePage: React.FC = () => {
  const navigate = useNavigate();
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [blocks, setBlocks] = useState<BlockOptionItem[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [lightingDate, setLightingDate] = useState<string>(todayStr);
  const [bloomingTargetDays, setBloomingTargetDays] = useState<number>(20);

  const [isLoadingBlocks, setIsLoadingBlocks] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ambil daftar kebun & blok riil
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const farms = await farmService.getAll();
        const extracted: BlockOptionItem[] = farms.flatMap((farm) =>
          (farm.blocks || []).map((b) => ({
            id: b.id,
            name: b.name,
            farmName: farm.name,
          }))
        );
        if (isMounted) {
          setBlocks(extracted);
          if (extracted.length > 0) {
            setSelectedBlockId(extracted[0].id);
          }
          setIsLoadingBlocks(false);
        }
      } catch {
        if (isMounted) {
          setBlocks([]);
          setIsLoadingBlocks(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Hitung estimasi panen otomatis
  const projectedHarvestDate = useMemo(() => {
    if (!lightingDate) return '';
    const date = new Date(lightingDate);
    if (isNaN(date.getTime())) return '';
    const totalDays = Number(bloomingTargetDays || 20) + 30;
    date.setDate(date.getDate() + totalDays);
    return date.toISOString().split('T')[0];
  }, [lightingDate, bloomingTargetDays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBlockId) {
      setErrorMessage('Pilih blok lahan terlebih dahulu');
      return;
    }
    if (!lightingDate) {
      setErrorMessage('Tanggal mulai penyinaran wajib diisi');
      return;
    }
    if (!bloomingTargetDays || bloomingTargetDays < 1) {
      setErrorMessage('Target hari berbunga minimal 1 hari');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await harvestService.startHarvestCycle({
        block_id: selectedBlockId,
        tanggal_penyinaran: lightingDate,
        target_hari_berbunga: Number(bloomingTargetDays),
      });

      navigate('/admin/harvests');
    } catch (err: unknown) {
      setErrorMessage((err as Error)?.message || 'Gagal menyimpan siklus panen baru.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb & Header */}
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
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Baris 1: Blok Lahan & Tanggal Penyinaran */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                Pilih Blok Lahan <span className="text-rose-600 font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedBlockId}
                  onChange={(e) => setSelectedBlockId(e.target.value)}
                  disabled={isLoadingBlocks || blocks.length === 0}
                  className="w-full appearance-none bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none cursor-pointer shadow-2xs pr-10"
                >
                  {isLoadingBlocks ? (
                    <option value="">Memuat daftar blok lahan...</option>
                  ) : blocks.length === 0 ? (
                    <option value="">Tidak ada blok lahan aktif</option>
                  ) : (
                    blocks.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.farmName ? `${opt.farmName} — ${opt.name}` : opt.name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400">Pilih blok kebun yang akan menerima pencahayaan lampu LED.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                Tanggal Mulai Penyinaran <span className="text-rose-600 font-bold">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={lightingDate}
                  onChange={(e) => setLightingDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none shadow-2xs"
                />
              </div>
              <p className="text-[11px] text-slate-400">Tanggal pertama induksi lampu dinyalakan malam hari.</p>
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
                  required
                  value={bloomingTargetDays}
                  onChange={(e) => setBloomingTargetDays(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none shadow-2xs"
                  placeholder="Standar: 20 hari"
                />
              </div>
              <p className="text-[11px] text-slate-400">Rata-rata induksi fotoperiode membutuhkan 20–25 hari.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-800">
                Estimasi Tanggal Panen (Kalkulasi Otomatis)
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={projectedHarvestDate || 'Pilih tanggal penyinaran terlebih dahulu'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-800 outline-none cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Dihitung dari induksi bunga ({bloomingTargetDays} hari) + 30 hari pematangan buah.
              </p>
            </div>
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
            disabled={isSubmitting || blocks.length === 0}
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
