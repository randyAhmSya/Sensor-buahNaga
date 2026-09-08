import React, { useState, useEffect } from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { QRCodeItem } from '@/data/mockQRCodes';
import { qrCodeService } from '@/services/api';
import { QRCodeFilterBar } from '../components/QRCodeFilterBar';
import { QRCodeTable } from '../components/QRCodeTable';
import { QRCodeDetailModal } from '../components/QRCodeDetailModal';
import { GenerateQRModal } from '../components/GenerateQRModal';
import { DeleteQRModal } from '../components/DeleteQRModal';

export const QRCodeManagementPage: React.FC = () => {
  const [items, setItems] = useState<QRCodeItem[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarm, setSelectedFarm] = useState('Semua Kebun');
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [selectedPairing, setSelectedPairing] = useState('Semua Pairing');

  const [selectedQRForDetail, setSelectedQRForDetail] = useState<QRCodeItem | null>(null);
  const [selectedQRToDelete, setSelectedQRToDelete] = useState<QRCodeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    qrCodeService.getAll().then((data) => {
      if (isMounted) {
        setItems(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = items.filter((item) => {
    const matchSearch =
      item.codeText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.blockName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFarm = selectedFarm === 'Semua Kebun' || item.farmName === selectedFarm;
    const matchStatus = selectedStatus === 'Semua Status' || item.status === selectedStatus;
    const matchPairing = selectedPairing === 'Semua Pairing' || item.pairingStatus === selectedPairing;

    return matchSearch && matchFarm && matchStatus && matchPairing;
  });

  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'Aktif' ? 'Nonaktif' : 'Aktif' }
          : item
      )
    );
  };

  const handleConfirmDelete = async (id: string) => {
    setIsDeleting(true);
    await qrCodeService.delete(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    setIsDeleting(false);
    setSelectedQRToDelete(null);
  };

  const handleGenerateNew = (data: { farmName: string; blockName: string; codeText: string }) => {
    const newItem: QRCodeItem = {
      id: `qr-${Date.now()}`,
      codeText: data.codeText,
      qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.codeText}`,
      farmName: data.farmName,
      blockName: data.blockName,
      status: 'Aktif',
      pairingStatus: 'Belum Terhubung',
      createdAt: 'Hari Ini',
    };
    setItems((prev) => [newItem, ...prev]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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
            onClick={() => alert('Mengunduh seluruh berkas QR Code...')}
            className="w-full sm:w-auto flex flex-row items-center justify-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Download Semua QR</span>
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
        onGenerate={handleGenerateNew}
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
