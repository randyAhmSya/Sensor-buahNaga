import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Printer, 
  RefreshCw, 
  Power 
} from 'lucide-react';
import { qrCodeService } from '@/services/qrService';
import { sensorService } from '@/services/sensorService';
import { nodeService } from '@/services/nodeService';
import { qrKeys } from '@/services/queryKeys';
import { PrintQRModal, type PrintQRModalData } from '../components/PrintQRModal';
import { DebouncedSearchInput } from '@/components/common/DebouncedSearchInput';
import { useNotify } from '@/context/NotificationContext';

export interface RegisteredQRItem {
  id: string;
  qrId: string;
  sensorId: string;
  nodeCode: string;
  qrCodeText: string;
  farmName: string;
  blockName: string;
  status: boolean;
  createdAt?: string;
}

export const QRCodeManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const notify = useNotify();

  // Tab aktif: default Tab 1 ("registered") sesuai permintaan petani
  const [activeTab, setActiveTab] = useState<'registered' | 'logs'>('registered');
  const [selectedPrintQR, setSelectedPrintQR] = useState<PrintQRModalData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isActionPending, setIsActionPending] = useState(false);

  // Ambil daftar node sensor untuk mendapatkan stiker QR terdaftar
  const { 
    data: nodes = [], 
    isLoading: isLoadingNodes, 
    refetch: refetchNodes 
  } = useQuery({
    queryKey: ['nodes', 'all-with-qr'],
    queryFn: () => nodeService.getAll(),
  });

  // Ambil riwayat log scan dari backend
  const { 
    data: scanLogs = [], 
    isLoading: isLoadingLogs, 
    refetch: refetchLogs 
  } = useQuery({
    queryKey: qrKeys.logs(),
    queryFn: () => qrCodeService.getLogs(),
  });

  // Susun data QR terdaftar dari nodes (1 baris per node sensor) dengan lookup kode stiker asli
  const registeredQRs: RegisteredQRItem[] = useMemo(() => {
    // Buat map lookup stiker dari log pemindaian berdasarkan qr_id dan sensor_id
    const logLookup = new Map<string, { codeText: string; status: boolean; id_qr?: string }>();
    for (const log of scanLogs) {
      const qr = log.kode_qr as unknown as {
        id_qr?: string;
        kode_qr?: string;
        teks_kode_qr?: string;
        status_qr?: boolean | number;
        node_sensor?: {
          id_sensor?: string;
          kode_perangkat?: string;
        };
      } | undefined;
      const code = qr?.kode_qr || qr?.teks_kode_qr;
      if (code) {
        const status = Boolean(qr?.status_qr);
        const id_qr = qr?.id_qr || log.qr_id;
        if (qr?.id_qr) logLookup.set(qr.id_qr, { codeText: code, status, id_qr });
        if (log.qr_id) logLookup.set(log.qr_id, { codeText: code, status, id_qr });
        if (qr?.node_sensor?.id_sensor) logLookup.set(qr.node_sensor.id_sensor, { codeText: code, status, id_qr });
        if (qr?.node_sensor?.kode_perangkat) logLookup.set(qr.node_sensor.kode_perangkat, { codeText: code, status, id_qr });
      }
    }

    const list: RegisteredQRItem[] = [];
    const seenSensorKeys = new Set<string>();

    for (const node of nodes) {
      const sensorKey = node.id_sensor || node.kode_perangkat;
      if (seenSensorKeys.has(sensorKey)) continue;
      seenSensorKeys.add(sensorKey);

      // Lookup string stiker asli
      const rawNode = node as unknown as {
        kode_qr?: { id_qr?: string; kode_qr?: string; teks_kode_qr?: string; status_qr?: boolean | number };
        qr_code?: string;
      };

      const matchedLog =
        (node.qr_id ? logLookup.get(node.qr_id) : undefined) ||
        logLookup.get(node.id_sensor) ||
        logLookup.get(node.kode_perangkat);

      const qrCodeText =
        rawNode.kode_qr?.kode_qr ||
        rawNode.kode_qr?.teks_kode_qr ||
        rawNode.qr_code ||
        node.qr?.teks_kode_qr ||
        matchedLog?.codeText ||
        'QR-NODE-2BLOEF';

      const qrId =
        rawNode.kode_qr?.id_qr ||
        node.qr?.id_qr ||
        node.qr_id ||
        `qr-${node.id_sensor || node.kode_perangkat}`;

      const status =
        matchedLog !== undefined
          ? matchedLog.status
          : node.qr?.status_qr === true ||
            node.qr?.status_qr === 1 ||
            rawNode.kode_qr?.status_qr === true ||
            rawNode.kode_qr?.status_qr === 1 ||
            true;

      list.push({
        id: qrId,
        qrId,
        sensorId: node.id_sensor,
        nodeCode: node.kode_perangkat,
        qrCodeText,
        farmName: node.blok?.kebun?.nama_kebun || 'Kebun Buah Naga',
        blockName: node.blok?.nama_blok || 'Blok A',
        status,
        createdAt: node.created_at,
      });
    }

    return list;
  }, [nodes, scanLogs]);

  // Filter QR Terdaftar
  const filteredRegisteredQRs = useMemo(() => {
    if (!searchQuery.trim()) return registeredQRs;
    const q = searchQuery.toLowerCase();
    return registeredQRs.filter(
      (item) =>
        item.qrCodeText.toLowerCase().includes(q) ||
        item.nodeCode.toLowerCase().includes(q) ||
        item.blockName.toLowerCase().includes(q) ||
        item.farmName.toLowerCase().includes(q)
    );
  }, [registeredQRs, searchQuery]);

  // Normalisasi log scan dengan resolusi nama Blok & Kebun
  const enrichedScanLogs = useMemo(() => {
    return scanLogs.map((log) => {
      const qr = log.kode_qr;
      const node = qr?.node_sensor;
      const matchedNode = nodes.find(
        (n) =>
          n.id_sensor === node?.id_sensor ||
          n.kode_perangkat === node?.kode_perangkat ||
          (node?.blok?.id_blok && n.blok?.id_blok === node?.blok?.id_blok)
      );
      const blockName = node?.blok?.nama_blok || matchedNode?.blok?.nama_blok || 'Blok A';
      const farmName = matchedNode?.blok?.kebun?.nama_kebun || 'Kebun Buah Naga';
      return {
        ...log,
        resolvedBlockName: blockName,
        resolvedFarmName: farmName,
      };
    });
  }, [scanLogs, nodes]);

  // Filter Log Scan
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return enrichedScanLogs;
    const q = searchQuery.toLowerCase();
    return enrichedScanLogs.filter((log) => {
      const qrText = log.kode_qr?.teks_kode_qr?.toLowerCase() || '';
      const deviceName = log.kode_qr?.node_sensor?.kode_perangkat?.toLowerCase() || '';
      const blockName = log.resolvedBlockName.toLowerCase();
      return qrText.includes(q) || deviceName.includes(q) || blockName.includes(q);
    });
  }, [enrichedScanLogs, searchQuery]);

  // Handler: Buka modal pratinjau & cetak stiker QR
  const handleOpenPrintModal = (item: RegisteredQRItem) => {
    setSelectedPrintQR({
      qrId: item.qrId,
      qrCodeText: item.qrCodeText,
      nodeCode: item.nodeCode,
      farmName: item.farmName,
      blockName: item.blockName,
      status: item.status,
      createdAt: item.createdAt,
    });
  };

  // Handler: Ubah Status Aktif / Nonaktif QR
  const handleToggleStatus = async (item: RegisteredQRItem) => {
    if (!item.qrId) {
      notify.error('Validasi Gagal', 'ID QR tidak valid.');
      return;
    }
    setIsActionPending(true);
    try {
      await qrCodeService.update(item.qrId, { status_qr: !item.status });
      notify.success(
        'Status Diperbarui',
        `Status QR ${item.qrCodeText} diubah menjadi ${!item.status ? 'Aktif' : 'Nonaktif'}.`
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: qrKeys.all }),
        refetchNodes(),
        refetchLogs(),
      ]);
    } catch {
      notify.error('Gagal Memperbarui', 'Gagal memperbarui status QR.');
    } finally {
      setIsActionPending(false);
    }
  };

  // Handler: Buat Ulang Kode QR Baru untuk Node Sensor
  const handleGenerateNewQR = async (item: RegisteredQRItem) => {
    if (!item.sensorId) {
      notify.error('Validasi Gagal', 'ID Node Sensor tidak ditemukan.');
      return;
    }
    setIsActionPending(true);
    try {
      await sensorService.generateNewQr(item.sensorId);
      notify.success(
        'Kode QR Dibuat',
        `Kode QR baru untuk ${item.nodeCode} berhasil dibuat.`
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: qrKeys.all }),
        refetchNodes(),
        refetchLogs(),
      ]);
    } catch {
      notify.error('Gagal Membuat QR', 'Terjadi kesalahan sistem saat membuat stiker QR baru.');
    } finally {
      setIsActionPending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Halaman: Fokus Manajemen Stiker QR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Manajemen Stiker QR Perangkat
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Kelola stiker QR fisik node sensor dan pantau riwayat verifikasi lapangan dari perangkat mobile.
          </p>
        </div>
      </div>

      {/* Navigasi Tab */}
      <div className="flex items-center justify-between border-b border-slate-200 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('registered')}
            className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'registered'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Daftar QR Perangkat Terdaftar</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'registered'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {registeredQRs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-3 text-xs md:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Riwayat Log Pemindaian</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'logs'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {scanLogs.length}
            </span>
          </button>
        </div>

        {/* Input Pencarian Universal */}
        <div className="w-full sm:w-64 pb-2 sm:pb-0">
          <DebouncedSearchInput
            value={searchQuery}
            onDebouncedChange={setSearchQuery}
            placeholder={
              activeTab === 'registered'
                ? 'Cari QR, node, atau blok...'
                : 'Cari riwayat scan...'
            }
          />
        </div>
      </div>

      {/* Konten Tab 1: Daftar QR Perangkat Terdaftar */}
      {activeTab === 'registered' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Kode QR</th>
                  <th className="py-3.5 px-4">Node Sensor</th>
                  <th className="py-3.5 px-4">Blok Lahan</th>
                  <th className="py-3.5 px-4">Kebun</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingNodes ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      Memuat daftar kode QR terdaftar...
                    </td>
                  </tr>
                ) : filteredRegisteredQRs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      {searchQuery
                        ? 'Tidak ada kode QR yang cocok dengan kata kunci pencarian.'
                        : 'Belum ada perangkat node dengan kode QR.'}
                    </td>
                  </tr>
                ) : (
                  filteredRegisteredQRs.map((item) => (
                    <tr key={item.id || item.sensorId || item.qrId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                        {item.qrCodeText}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {item.nodeCode}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-emerald-800">
                        {item.blockName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.farmName}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border-2 ${
                            item.status
                              ? 'bg-white text-emerald-800 border-emerald-600'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status ? 'bg-emerald-600' : 'bg-slate-400'
                            }`}
                          />
                          <span>{item.status ? 'Aktif' : 'Nonaktif'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenPrintModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                            title="Pratinjau & Cetak Stiker"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak</span>
                          </button>

                          <button
                            type="button"
                            disabled={isActionPending}
                            onClick={() => handleToggleStatus(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
                            title={item.status ? 'Nonaktifkan QR' : 'Aktifkan QR'}
                          >
                            <Power className="w-3.5 h-3.5 text-slate-500" />
                            <span>{item.status ? 'Nonaktifkan' : 'Aktifkan'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={isActionPending}
                            onClick={() => handleGenerateNewQR(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
                            title="Generate Stiker QR Baru"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                            <span>Buat Baru</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Konten Tab 2: Riwayat Log Pemindaian Lapangan */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Waktu Pindai</th>
                  <th className="py-3.5 px-4">Kode QR</th>
                  <th className="py-3.5 px-4">Perangkat Sensor</th>
                  <th className="py-3.5 px-4">Blok Lahan</th>
                  <th className="py-3.5 px-4">Platform</th>
                  <th className="py-3.5 px-4 text-right">Status Stiker</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingLogs ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      Memuat riwayat pemindaian...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      {searchQuery
                        ? 'Tidak ditemukan riwayat scan yang cocok dengan pencarian.'
                        : 'Belum ada data riwayat pemindaian QR.'}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => {
                    const rawTime = log.dicatat_pada || log.created_at;
                    const formattedTime = rawTime
                      ? new Date(rawTime).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Waktu tidak tersedia';

                    const qr = log.kode_qr;
                    const node = qr?.node_sensor;
                    const isQrActive = Boolean(qr?.status_qr);

                    return (
                      <tr
                        key={log.id_log || log.id || `${log.qr_id || 'scan'}-${log.dicatat_pada || log.created_at || idx}-${idx}`}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {formattedTime}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {qr?.teks_kode_qr || 'QR Tidak Diketahui'}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {node?.kode_perangkat || 'NODE-TEST-001'}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-emerald-800">
                          {log.resolvedBlockName}
                        </td>
                        <td className="py-3.5 px-4 capitalize text-slate-500">
                          {log.platform || 'web'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border-2 ${
                              isQrActive
                                ? 'bg-white text-emerald-800 border-emerald-600'
                                : 'bg-white text-slate-700 border-slate-300'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isQrActive ? 'bg-emerald-600' : 'bg-slate-400'
                              }`}
                            />
                            <span>{isQrActive ? 'Aktif' : 'Nonaktif'}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* Modal Cetak & Pratinjau Stiker QR */}
      {selectedPrintQR && (
        <PrintQRModal
          isOpen={Boolean(selectedPrintQR)}
          onClose={() => setSelectedPrintQR(null)}
          qrData={selectedPrintQR}
        />
      )}
    </div>
  );
};

export default QRCodeManagementPage;
