import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Sliders, Zap, Clock, ChevronDown, Lightbulb, SunMedium } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { scheduleService } from '@/services/scheduleService';
import { scheduleKeys } from '@/services/queryKeys';
import { useNotify } from '@/context/NotificationContext';
import { ApiError } from '@/services/api';

interface NodeOption {
  id: string;
  code: string;
  location: string;
  status: string;
}

export const QuickManualControlCard: React.FC = () => {
  const queryClient = useQueryClient();
  const notify = useNotify();
  const [nodes, setNodes] = useState<NodeOption[]>([]);
  const [selectedNodeCode, setSelectedNodeCode] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(80);
  const [cooldown, setCooldown] = useState<number>(0);
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    scheduleService
      .getAvailableNodesForSchedule()
      .then((items) => {
        if (isMounted && items.length > 0) {
          setNodes(items);
          setSelectedNodeCode(items[0].code);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Timer cooldown 7 detik
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const handleApply = async (overrideIntensity?: number) => {
    if (cooldown > 0) {
      notify.warning(
        'Cooldown Slider Aktif',
        `Harap tunggu ${cooldown} detik sebelum mengubah intensitas lagi.`,
        { id: 'schedule-cooldown' }
      );
      return;
    }
    if (isSending) return;

    const targetValue = overrideIntensity !== undefined ? overrideIntensity : intensity;
    setIsSending(true);

    try {
      const targetNode = nodes.find((n) => n.code === selectedNodeCode);
      if (!targetNode) {
        throw new Error('Pilih node terlebih dahulu');
      }

      // Kirim pembaruan ke jadwal aktif sensor atau trigger update manual
      const activeSchedule = await scheduleService.getActive(targetNode.id);
      if (activeSchedule?.id_jadwal) {
        await scheduleService.update(activeSchedule.id_jadwal, {
          instensitas_cahaya: targetValue,
        });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: scheduleKeys.all, refetchType: 'all' }),
          queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
        ]);
      }

      notify.success(
        'Intensitas Diperbarui',
        `Lampu ${selectedNodeCode} berhasil diatur ke ${targetValue}%.`
      );

      // Aktifkan cooldown visual 7 detik untuk mencegah JadwalCooldownException
      setCooldown(7);
    } catch (err: unknown) {
      const is429 =
        (err instanceof ApiError && err.status === 429) ||
        (err as Error)?.message?.toLowerCase().includes('cooldown') ||
        (err as Error)?.message?.toLowerCase().includes('terlalu cepat');

      if (is429) {
        notify.warning(
          'Cooldown Slider Aktif',
          'Perintah intensitas dikirim terlalu cepat. Harap tunggu beberapa detik.',
          { id: 'schedule-cooldown' }
        );
      } else {
        const errMsg = (err as Error)?.message || 'Gagal menerapkan intensitas manual.';
        notify.error('Gagal Mengatur Intensitas', errMsg);
      }

      // Berikan cooldown protektif jika terjadi error laju transmisi
      setCooldown(7);
    } finally {
      setIsSending(false);
    }
  };

  const isLocked = cooldown > 0 || isSending;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Kontrol Manual Lampu</h2>
            <p className="text-xs text-slate-500">
              Penyesuaian langsung intensitas lampu LED dengan proteksi jeda 7 detik.
            </p>
          </div>
        </div>

        {cooldown > 0 ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-xs font-bold text-slate-800 animate-pulse">
            <Clock className="w-4 h-4 text-slate-700" />
            <span>Cooldown: {cooldown} detik</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <Zap className="w-3.5 h-3.5" />
            <span>Siap Transmisi</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        {/* Pilihan Node */}
        <div className="lg:col-span-4 space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Pilih Node Target</label>
          <div className="relative">
            <select
              value={selectedNodeCode}
              onChange={(e) => setSelectedNodeCode(e.target.value)}
              disabled={isLocked}
              className="w-full appearance-none bg-white border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-900 outline-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed pr-10 cursor-pointer shadow-2xs"
            >
              {nodes.map((node) => (
                <option key={node.id || node.code} value={node.code}>
                  {node.code} ({node.location})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Slider Intensitas */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Tingkat Pencahayaan</span>
            <span className="bg-slate-100 text-slate-800 border border-slate-200 font-mono px-2 py-0.5 rounded-md font-bold">
              {intensity}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Lightbulb className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              onPointerUp={() => void handleApply(intensity)}
              onTouchEnd={() => void handleApply(intensity)}
              onKeyUp={(e) => {
                if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(e.key)) {
                  void handleApply(intensity);
                }
              }}
              disabled={isLocked}
              aria-label="Tingkat pencahayaan lampu"
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <SunMedium className="w-4 h-4 text-slate-500 shrink-0" />
          </div>
        </div>

        {/* Tombol Eksekusi dengan Cooldown Guard */}
        <div className="lg:col-span-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => void handleApply(intensity)}
            disabled={isLocked}
            className="w-full min-h-[42px] flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-500 text-white font-semibold rounded-xl shadow-xs transition-all"
          >
            {isSending ? (
              <span className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Mengirim...</span>
              </span>
            ) : cooldown > 0 ? (
              <span className="text-xs font-bold text-slate-700">Tunggu {cooldown}s</span>
            ) : (
              <span className="text-xs">Terapkan Intensitas</span>
            )}
          </Button>
        </div>
      </div>

      {cooldown > 0 && (
        <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2.5 leading-relaxed">
          Proteksi cooldown aktif selama 7 detik untuk mencegah frekuensi pengiriman sinyal radio berlebih (JadwalCooldownException). Slider akan dapat digeser kembali setelah hitung mundur selesai.
        </p>
      )}
    </div>
  );
};
