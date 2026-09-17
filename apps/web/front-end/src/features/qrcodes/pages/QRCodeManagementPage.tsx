import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Download, ScanLine } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Toast, type ToastType } from '@/components/feedback/Toast';
import type { QRCodeItem } from '@/types/qr.types';
import type { FarmItem } from '@/types/farm.types';
import { qrCodeService } from '@/services/qrService';
import { farmService } from '@/services/farmService';
import { QRCodeFilterBar } from '../components/QRCodeFilterBar';
import { QRCodeTable } from '../components/QRCodeTable';
import { QRCodeDetailModal } from '../components/QRCodeDetailModal';
import { GenerateQRModal } from '../components/GenerateQRModal';
import { ScanQRModal } from '../components/ScanQRModal';
import { DeleteQRModal } from '../components/DeleteQRModal';

interface PageToast {
  type: ToastType;
  title: string;
  message?: string;
}

export const QRCodeManagementPage: React.FC = () => {
  const [items, setItems] = useState<QRCodeItem[]>([]);
  const [farms, setFarms] = useState<FarmItem[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarm, setSelectedFarm] = useState('Semua Kebun');
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [selectedPairing, setSelectedPairing] = useState('Semua Pairing');

  const [selectedQRForDetail, setSelectedQRForDetail] = useState<QRCodeItem | null>(null);
  const [selectedQRToDelete, setSelectedQRToDelete] = useState<QRCodeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [toast, setToast] = useState<PageToast | null>(null);

  const fetchQRCodes = useCallback(async () => {
    try {
      const data = await qrCodeService.getAll();
      setItems(data);
    } catch {
      setItems([]);
    }
  }, []);

  const fetchFarms = useCallback(async () => {
    try {
      const data = await farmService.getAll();
      setFarms(data);
    } catch {
      setFarms([]);
    }
  }, []);

  useEffect(() => {
    fetchQRCodes();
    fetchFarms();
  }, [fetchQRCodes, fetchFarms]);

  const farmOptions = useMemo(() => {
    return [
      { label: 'Semua Kebun', value: 'Semua Kebun' },
      ...farms.map((farm) => ({ label: farm.name, value: farm.name })),
    ];
  }, [farms]);

  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.codeText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.blockName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFarm = selectedFarm === 'Semua Kebun' || item.farmName === selectedFarm;
    const matchStatus = selectedStatus === 'Semua Status' || item.status === selectedStatus;
    const matchPairing = selectedPairing === 'Semua Pairing' || item.pairingStatus === selectedPairing;

    return matchSearch && matchFarm && matchStatus && matchPairing;
  });

  const handleToggleStatus = async (id: string) => {
    const currentItem = items.find((item) => item.id === id);
    if (!currentItem) return;
    const newStatusBool = currentItem.status !== 'Aktif';

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: newStatusBool ? 'Aktif' : 'Nonaktif' }
          : item
      )
    );

    try {
      await qrCodeService.update(id, { status_qr: newStatusBool ? 1 : 0 });
      setToast({
        type: 'success',
        title: 'Status Diperbarui',
        message: `Status QR ${currentItem.codeText} berhasil diubah menjadi ${newStatusBool ? 'Aktif' : 'Nonaktif'}.`,
      });
    } catch {
      fetchQRCodes();
      setToast({
        type: 'error',
        title: 'Gagal Mengubah Status',
        message: 'Terjadi kendala saat mengubah status QR code.',
      });
    }
  };

  const handleConfirmDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await qrCodeService.delete(id);
      setToast({
        type: 'success',
        title: 'QR Code Dihapus',
        message: 'Kode QR berhasil dihapus dari sistem.',
      });
      await fetchQRCodes();
    } catch {
      setToast({
        type: 'error',
        title: 'Gagal Menghapus',
        message: 'Terjadi kendala saat menghapus kode QR.',
      });
    } finally {
      setIsDeleting(false);
      setSelectedQRToDelete(null);
    }
  };

  const handleGenerateSuccess = async (data: {
    farmName: string;
    blockName: string;
    codeText: string;
    newItem?: QRCodeItem;
  }) => {
    if (data.newItem) {
      setItems((prev) => [data.newItem!, ...prev]);
    }
    await fetchQRCodes();
    setToast({
      type: 'success',
      title: 'QR Code Berhasil Digenerate',
      message: `Kode ${data.codeText} berhasil dibuat untuk ${data.blockName} (${data.farmName}).`,
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 relative">
      {/* Toast Feedback */}
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Kelola QR Code</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Kelola dan pantau kode QR untuk pairing perangkat IoT serta identifikasi blok kebun.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => {
              setToast({
                type: 'info',
                title: 'Unduh Semua QR Code',
                message: 'Fitur download batch QR Code sedang diproses...',
              });
            }}
            className="w-full sm:w-auto flex flex-row items-center justify-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Download Semua QR</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => setIsScanModalOpen(true)}
            className="w-full sm:w-auto flex flex-row items-center justify-center gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold"
          >
            <ScanLine className="w-4 h-4 shrink-0" />
            <span>Scan QR Code</span>
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setIsGenerateModalOpen(true)}
            className="w-full sm:w-auto flex flex-row items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Generate QR Code</span>
          </Button>
        </div>
      </div>

      <QRCodeFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedFarm={selectedFarm}
        onFarmChange={setSelectedFarm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedPairing={selectedPairing}
        onPairingChange={setSelectedPairing}
        farmOptions={farmOptions}
      />

      <QRCodeTable
        items={filteredItems}
        onViewDetail={(item) => setSelectedQRForDetail(item)}
        onToggleStatus={handleToggleStatus}
        onDelete={(item) => setSelectedQRToDelete(item)}
      />

      <QRCodeDetailModal
        isOpen={Boolean(selectedQRForDetail)}
        item={selectedQRForDetail}
        onClose={() => setSelectedQRForDetail(null)}
      />

      <GenerateQRModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onSuccess={handleGenerateSuccess}
      />

      <ScanQRModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
      />

      <DeleteQRModal
        isOpen={Boolean(selectedQRToDelete)}
        item={selectedQRToDelete}
        onClose={() => setSelectedQRToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default QRCodeManagementPage;

