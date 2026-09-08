import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getHarvestMetrics } from '@/data/mockHarvests';
import type { HarvestCycleItem } from '@/data/mockHarvests';
import { harvestService } from '@/services/api';
import { HarvestSummaryCards } from '../components/HarvestSummaryCards';
import { HarvestFilterBar } from '../components/HarvestFilterBar';
import { HarvestCycleTable } from '../components/HarvestCycleTable';
import { EditHarvestActualModal } from '../components/EditHarvestActualModal';

export const HarvestEstimationPage: React.FC = () => {
  const navigate = useNavigate();
  const metrics = getHarvestMetrics();
  const [cycles, setCycles] = useState<HarvestCycleItem[]>([]);

  const [activeTab, setActiveTab] = useState<'Semua' | 'Berjalan' | 'Selesai'>('Semua');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCycleForEdit, setSelectedCycleForEdit] = useState<HarvestCycleItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    harvestService.getAll().then((data) => {
      if (isMounted) {
        setCycles(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCycles = cycles.filter((item) => {
    const matchTab = activeTab === 'Semua' || item.status === activeTab;
    const matchSearch =
      item.blockName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.farmName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  const handleSaveActual = (id: string, actualDate: string, status: 'Berjalan' | 'Selesai') => {
    setCycles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, actualHarvestDate: actualDate, status } : c))
    );
  };

  const handleDelete = (id: string) => {
    setCycles((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Estimasi Panen</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Pantau dan kelola siklus panen tanaman buah naga berbasis pencahayaan buatan.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => navigate('/admin/harvests/new')}
          className="flex flex-row items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Mulai Siklus Baru</span>
        </Button>
      </div>

      <HarvestSummaryCards metrics={metrics} />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <HarvestFilterBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <HarvestCycleTable
          cycles={filteredCycles}
          onEditActual={(cycle) => setSelectedCycleForEdit(cycle)}
          onDeleteCycle={handleDelete}
        />
      </div>

      <EditHarvestActualModal
        isOpen={Boolean(selectedCycleForEdit)}
        cycle={selectedCycleForEdit}
        onClose={() => setSelectedCycleForEdit(null)}
        onSave={handleSaveActual}
      />
    </div>
  );
};

export default HarvestEstimationPage;
