import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Toast, type ToastType } from '@/components/feedback/Toast';
import { farmService } from '@/services/farmService';
import { harvestService } from '@/services/harvestService';
import type { HarvestCycle, HarvestMetrics } from '../types/harvest.types';
import { HarvestSummaryCards } from '../components/HarvestSummaryCards';
import { HarvestFilterBar, type HarvestTabFilter } from '../components/HarvestFilterBar';
import { HarvestCycleTable } from '../components/HarvestCycleTable';
import { CreateHarvestCycleModal, type BlockOptionItem } from '../components/CreateHarvestCycleModal';
import { RecordFlowerModal } from '../components/RecordFlowerModal';
import { RecordHarvestModal } from '../components/RecordHarvestModal';
import { DeleteHarvestCycleModal } from '../components/DeleteHarvestCycleModal';

interface PageToast {
  type: ToastType;
  title: string;
  message?: string;
}

export const HarvestEstimationPage: React.FC = () => {

  // State Data Kebun & Blok
  const [blocks, setBlocks] = useState<BlockOptionItem[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('ALL');

  // State Data Siklus Panen
  const [cycles, setCycles] = useState<HarvestCycle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // State Filter & Pencarian
  const [activeTab, setActiveTab] = useState<HarvestTabFilter>('Semua');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // State Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [cycleForFlower, setCycleForFlower] = useState<HarvestCycle | null>(null);
  const [cycleForHarvest, setCycleForHarvest] = useState<HarvestCycle | null>(null);
  const [cycleForDelete, setCycleForDelete] = useState<HarvestCycle | null>(null);

  // State Notifikasi Toast
  const [toast, setToast] = useState<PageToast | null>(null);

  // 1. Ambil daftar kebun & blok terdaftar
  const loadFarmsAndBlocks = useCallback(async () => {
    try {
      const farms = await farmService.getAll();
      const extractedBlocks: BlockOptionItem[] = farms.flatMap((f) =>
        (f.blocks || []).map((b) => ({
          id: b.id,
          name: b.name,
          farmName: f.name,
        }))
      );
      setBlocks(extractedBlocks);
      return extractedBlocks;
    } catch {
      setBlocks([]);
      return [];
    }
  }, []);

  // 2. Ambil daftar siklus panen sesuai blok yang dipilih
  const loadCycles = useCallback(
    async (targetBlockId: string, currentBlocks: BlockOptionItem[]) => {
      setIsLoading(true);
      try {
        if (targetBlockId === 'ALL') {
          const allCycles = await harvestService.getAllCycles(currentBlocks);
          setCycles(allCycles);
        } else {
          const blk = currentBlocks.find((b) => b.id === targetBlockId);
          const singleCycles = await harvestService.getHarvestCycles(targetBlockId, {
            blockName: blk?.name,
            farmName: blk?.farmName,
          });
          setCycles(singleCycles);
        }
      } catch {
        setCycles([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Inisialisasi data halaman
  useEffect(() => {
    let isMounted = true;
    (async () => {
      const loadedBlocks = await loadFarmsAndBlocks();
      if (isMounted) {
        await loadCycles('ALL', loadedBlocks);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [loadFarmsAndBlocks, loadCycles]);

  // Perubahan pilihan blok
  const handleBlockChange = (blockId: string) => {
    setSelectedBlockId(blockId);
    loadCycles(blockId, blocks);
  };

  // Manual Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    const refreshedBlocks = await loadFarmsAndBlocks();
    await loadCycles(selectedBlockId, refreshedBlocks);
    setIsRefreshing(false);
    setToast({
      type: 'info',
      title: 'Data Diperbarui',
      message: 'Riwayat siklus panen berhasil disinkronkan dengan server.',
    });
  };

  // Filter siklus berdasarkan tab status dan keyword pencarian
  const filteredCycles = useMemo(() => {
    return cycles.filter((item) => {
      const matchTab = activeTab === 'Semua' || item.status_siklus === activeTab;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        (item.blockName && item.blockName.toLowerCase().includes(term)) ||
        (item.farmName && item.farmName.toLowerCase().includes(term)) ||
        item.id_siklus_panen.toLowerCase().includes(term);
      return matchTab && matchSearch;
    });
  }, [cycles, activeTab, searchTerm]);

  // Perhitungan metrik ringkasan riil
  const metrics: HarvestMetrics = useMemo(() => {
    const runningCycles = cycles.filter((c) => c.status_siklus === 'BERJALAN');
    const completed = cycles.filter((c) => c.status_siklus === 'SELESAI').length;

    // Cari estimasi panen terdekat dari siklus berjalan
    let nearestDate = '';
    const runningWithEstimates = runningCycles
      .map((c) => c.estimasi_tanggal_panen)
      .filter(Boolean)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    if (runningWithEstimates.length > 0) {
      nearestDate = runningWithEstimates[0];
    }

    return {
      activeCycles: runningCycles.length,
      nearestHarvestDate: nearestDate,
      completedCycles: completed,
    };
  }, [cycles]);

  // Handlers Modals
  const handleCreateSuccess = (newCycle: HarvestCycle) => {
    setCycles((prev) => [newCycle, ...prev]);
    setToast({
      type: 'success',
      title: 'Siklus Panen Baru Dimulai',
      message: `Siklus panen untuk ${newCycle.blockName} (${newCycle.farmName}) berhasil dicatat.`,
    });
  };

  const handleFlowerSuccess = (updatedCycle: HarvestCycle) => {
    setCycles((prev) =>
      prev.map((c) => (c.id_siklus_panen === updatedCycle.id_siklus_panen ? updatedCycle : c))
    );
    setToast({
      type: 'success',
      title: 'Bunga Aktual Dicatat',
      message: `Kemunculan bunga untuk ${updatedCycle.blockName} tercatat pada ${updatedCycle.tanggal_berbunga_aktual}.`,
    });
  };

  const handleHarvestSuccess = (updatedCycle: HarvestCycle) => {
    setCycles((prev) =>
      prev.map((c) => (c.id_siklus_panen === updatedCycle.id_siklus_panen ? updatedCycle : c))
    );
    setToast({
      type: 'success',
      title: 'Siklus Panen Selesai',
      message: `Panen buah untuk ${updatedCycle.blockName} berhasil dicatat pada ${updatedCycle.tanggal_panen}.`,
    });
  };

  const handleDeleteSuccess = (deletedId: string) => {
    setCycles((prev) => prev.filter((c) => c.id_siklus_panen !== deletedId));
    setToast({
      type: 'success',
      title: 'Siklus Dihapus',
      message: 'Data siklus panen berhasil dihapus dari sistem.',
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative pb-10">
      {/* Feedback Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
          <Toast
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Estimasi Panen</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Pantau dan kelola siklus panen tanaman buah naga berbasis pencahayaan lampu fotoperiode.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="flex flex-row items-center justify-center gap-2 border-slate-300 text-slate-700 hover:bg-white font-semibold shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex flex-row items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Mulai Siklus Baru</span>
          </Button>
        </div>
      </div>

      {/* Kartu Ringkasan Riil */}
      <HarvestSummaryCards metrics={metrics} />

      {/* Kontainer Tabel & Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <HarvestFilterBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedBlockId={selectedBlockId}
          onBlockChange={handleBlockChange}
          blocks={blocks}
        />

        <HarvestCycleTable
          cycles={filteredCycles}
          isLoading={isLoading}
          onRecordFlower={(cycle) => setCycleForFlower(cycle)}
          onRecordHarvest={(cycle) => setCycleForHarvest(cycle)}
          onDeleteCycle={(cycle) => setCycleForDelete(cycle)}
        />
      </div>

      {/* Modal Mulai Siklus Panen Baru */}
      <CreateHarvestCycleModal
        isOpen={isCreateModalOpen}
        blocks={blocks}
        defaultBlockId={selectedBlockId !== 'ALL' ? selectedBlockId : undefined}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Modal Catat Bunga Aktual */}
      <RecordFlowerModal
        isOpen={Boolean(cycleForFlower)}
        cycle={cycleForFlower}
        onClose={() => setCycleForFlower(null)}
        onSuccess={handleFlowerSuccess}
      />

      {/* Modal Catat Panen Nyata */}
      <RecordHarvestModal
        isOpen={Boolean(cycleForHarvest)}
        cycle={cycleForHarvest}
        onClose={() => setCycleForHarvest(null)}
        onSuccess={handleHarvestSuccess}
      />

      {/* Modal Konfirmasi Hapus Siklus */}
      <DeleteHarvestCycleModal
        isOpen={Boolean(cycleForDelete)}
        cycle={cycleForDelete}
        onClose={() => setCycleForDelete(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
};

export default HarvestEstimationPage;
