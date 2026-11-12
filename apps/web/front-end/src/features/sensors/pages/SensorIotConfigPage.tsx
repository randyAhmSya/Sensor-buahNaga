import { useState, useEffect, type FC } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Cpu, Copy, Check, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { nodeService } from '@/services/nodeService';
import { gatewayService } from '@/services/gatewayService';
import { gatewayKeys } from '@/services/queryKeys';
import { useFarmsWithBlocksQuery } from '@/hooks/queries/useFarmsQuery';
import { SensorDeviceConfigView, type SensorDeviceConfigData } from '../components/SensorDeviceConfigView';
import type { SensorNodeItem } from '@/types/sensor.types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatWattTerpasang } from '@/features/blocks/utils/lampWattMapper';
import { mapResetPairingError } from '../utils/resetPairingErrorMapper';

export const SensorIotConfigPage: FC = () => {
  const { sensorId } = useParams<{ sensorId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // 1. Baca data sensor dari navigation state jika tersedia untuk instant rendering
  const stateSensor = (location.state as { sensor?: SensorNodeItem } | undefined)?.sensor;
  const isStateMatching = Boolean(stateSensor && (!sensorId || stateSensor.id === sensorId));

  const [sensor, setSensor] = useState<SensorNodeItem | null>(isStateMatching && stateSensor ? stateSensor : null);
  const [resolvedPairingCode, setResolvedPairingCode] = useState<string>(
    stateSensor?.pairingCode || stateSensor?.kodePairing || ''
  );
  const [isLoading, setIsLoading] = useState<boolean>(!isStateMatching);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCopiedId, setIsCopiedId] = useState<boolean>(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [resetDialogError, setResetDialogError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  // Ambil data kebun dan blok untuk resolusi nama jika diakses via direct URL / refresh
  const { data: farmsWithBlocks } = useFarmsWithBlocksQuery({
    enabled: !isStateMatching && Boolean(sensorId),
  });

  // 2. Fallback fetch dari backend jika data tidak ada di navigation state
  useEffect(() => {
    if (isStateMatching && stateSensor) {
      setSensor(stateSensor);
      setResolvedPairingCode(stateSensor.pairingCode || stateSensor.kodePairing || '');
      setIsLoading(false);
      return;
    }

    if (!sensorId || !sensorId.trim()) {
      setLoadError('ID sensor tidak valid.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    const fetchSensorDetail = async () => {
      try {
        const cleanId = sensorId.trim();
        const nodeDetail = await nodeService.getById(cleanId);

        if (!nodeDetail) {
          if (isMounted) {
            setLoadError('Perangkat sensor tidak ditemukan di server.');
            setIsLoading(false);
          }
          return;
        }

        // Resolusi nama kebun dan blok
        let resolvedFarmName = nodeDetail.blok?.kebun?.nama_kebun || '';
        let resolvedBlockName = nodeDetail.blok?.nama_blok || '';
        let resolvedFarmId = nodeDetail.blok?.kebun?.id_kebun || nodeDetail.blok?.kebun_id || '';
        const targetBlockId = nodeDetail.blok_id || nodeDetail.blok?.id_blok || '';

        if (farmsWithBlocks && farmsWithBlocks.length > 0 && targetBlockId) {
          for (const farm of farmsWithBlocks) {
            const foundBlock = farm.blocks?.find(
              (b) => b.id === targetBlockId || String(b.id) === String(targetBlockId)
            );
            if (foundBlock) {
              resolvedFarmName = farm.name;
              resolvedFarmId = farm.id;
              resolvedBlockName = foundBlock.name;
              break;
            }
          }
        }

        // Kode pairing hanya diambil jika API benar-benar mengirimkannya (belum null/hangus)
        const pairing = nodeDetail.gateway?.kode_pairing || nodeDetail.kode_pairing || '';

        if (isMounted) {
          const rawStatus = (nodeDetail.status_koneksi || '').toLowerCase();
          const constructedSensor: SensorNodeItem = {
            id: nodeDetail.id_sensor || nodeDetail.id || cleanId,
            nodeCode: nodeDetail.kode_perangkat,
            farmId: resolvedFarmId,
            farmName: resolvedFarmName,
            blockId: targetBlockId,
            blockName: resolvedBlockName,
            status: rawStatus === 'aktif' || rawStatus === 'online' ? 'Online' : 'Offline',
            luxLevel: 0,
            temperature: 0,
            lastSeen: nodeDetail.terakhir_terlihat || 'Belum ada data',
            sparklineData: [],
            gatewayId:
              nodeDetail.gateway?.id_gateway ||
              nodeDetail.gateway?.id ||
              nodeDetail.gateway_id ||
              undefined,
            gatewayCode: nodeDetail.gateway?.kode_perangkat || undefined,
            gatewayStatus: nodeDetail.gateway?.status_koneksi || undefined,
            kodePairing: pairing || null,
            pairingCode: pairing || null,
            tokenGateway: null,
            jumlah_lampu: nodeDetail.jumlah_lampu ?? 1,
            watt_per_lampu: nodeDetail.watt_per_lampu ?? null,
            watt_terpasang: nodeDetail.watt_terpasang ?? null,
          };

          setSensor(constructedSensor);
          setResolvedPairingCode(pairing);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setLoadError('Gagal memuat informasi perangkat sensor.');
          setIsLoading(false);
        }
      }
    };

    fetchSensorDetail();

    return () => {
      isMounted = false;
    };
  }, [sensorId, isStateMatching, stateSensor, farmsWithBlocks]);

  // Resolusi tambahan untuk pairing code jika sensor sudah ada di state tetapi kode pairing belum terisi
  useEffect(() => {
    if (!sensor) return;

    if (!resolvedPairingCode && sensor.gatewayId) {
      let isMounted = true;
      const resolveExtraPairing = async () => {
        try {
          const gw = await gatewayService.getById(sensor.gatewayId!);
          if (isMounted && gw?.kode_pairing) {
            setResolvedPairingCode(gw.kode_pairing);
          }
        } catch {
          // fallback diam jika gateway tidak ditemukan
        }
      };

      resolveExtraPairing();
      return () => {
        isMounted = false;
      };
    }
  }, [sensor, resolvedPairingCode]);

  const handleCopySensorId = async (id: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(id);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = id;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopiedId(true);
      setTimeout(() => setIsCopiedId(false), 2000);
    } catch {
      // fallback
    }
  };

  // 3. Status Koneksi UI
  const rawStatus = sensor?.status?.toLowerCase() || '';
  const isOnline = rawStatus === 'online' || rawStatus === 'aktif';
  const isNeverSeen = rawStatus === 'belum_pernah_terlihat';
  const statusDisplay = isOnline ? 'Online' : isNeverSeen ? 'Belum pernah terhubung' : 'Offline';

  const handleConfirmReset = async () => {
    let targetGatewayId = sensor?.gatewayId;

    if (!targetGatewayId && sensorId) {
      try {
        const fresh = await nodeService.getById(sensorId.trim());
        targetGatewayId =
          fresh?.gateway?.id_gateway ||
          fresh?.gateway?.id ||
          fresh?.gateway_id ||
          undefined;
      } catch {
        // fallback diam
      }
    }

    if (!targetGatewayId) {
      setResetDialogError('Gateway tidak ditemukan pada perangkat ini.');
      return;
    }

    setIsResetting(true);
    setResetDialogError(null);

    try {
      const res = await gatewayService.resetPairing(targetGatewayId);
      const newPairingCode = res?.data?.kode_pairing || '';

      // Invalidate gateway cache (Koreksi 4)
      queryClient.invalidateQueries({ queryKey: gatewayKeys.all });
      if (sensor?.farmId) {
        queryClient.invalidateQueries({ queryKey: gatewayKeys.list(sensor.farmId) });
      }

      // Tutup dialog saat reset sukses
      setIsResetDialogOpen(false);

      // Jalankan refetch nyata dari backend
      try {
        const targetId = sensorId || sensor?.id;
        if (targetId) {
          const updatedNode = await nodeService.getById(targetId.trim());
          if (updatedNode) {
            const finalPairing =
              updatedNode.gateway?.kode_pairing ||
              updatedNode.kode_pairing ||
              newPairingCode;

            setResolvedPairingCode(finalPairing);
            setSensor((prev) =>
              prev
                ? {
                    ...prev,
                    gatewayId:
                      updatedNode.gateway?.id_gateway ||
                      updatedNode.gateway?.id ||
                      updatedNode.gateway_id ||
                      prev.gatewayId,
                    gatewayCode: updatedNode.gateway?.kode_perangkat || prev.gatewayCode,
                    gatewayStatus: updatedNode.gateway?.status_koneksi || prev.gatewayStatus,
                    kodePairing: finalPairing || null,
                    pairingCode: finalPairing || null,
                  }
                : prev
            );
          } else if (newPairingCode) {
            setResolvedPairingCode(newPairingCode);
          }
        } else if (newPairingCode) {
          setResolvedPairingCode(newPairingCode);
        }

        setFeedback({
          type: 'success',
          message:
            'Pairing gateway berhasil direset. Silakan periksa kode pairing baru pada template konfigurasi YAML.',
        });
      } catch {
        // Bila reset sukses tetapi refetch gagal
        if (newPairingCode) {
          setResolvedPairingCode(newPairingCode);
        }
        setFeedback({
          type: 'warning',
          message:
            'Pairing gateway berhasil direset. Gagal memuat ulang data terbaru dari server, silakan muat ulang halaman.',
        });
      }
    } catch (err: unknown) {
      const mappedMsg = mapResetPairingError(err);
      setResetDialogError(mappedMsg);
    } finally {
      setIsResetting(false);
    }
  };

  // Penyiapan data konfigurasi IoT yang jujur tanpa nilai karangan
  const configData: SensorDeviceConfigData = {
    nama: sensor?.blockName || sensor?.nodeCode || '',
    sensor_id: sensor?.id || sensorId || '',
    kode_node: sensor?.nodeCode || '',
    kode_gateway: sensor?.gatewayCode || null,
    kode_pairing: resolvedPairingCode || null,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb navigasi kembali */}
      <div>
        <Link
          to="/kebun/sensors"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Kembali ke Monitoring Sensor</span>
        </Link>
      </div>

      {/* State Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <div className="h-6 bg-slate-200 rounded-md w-1/3" />
            <div className="h-4 bg-slate-100 rounded-md w-1/2" />
            <div className="flex gap-2">
              <div className="h-7 bg-slate-200 rounded-lg w-28" />
              <div className="h-7 bg-slate-200 rounded-lg w-36" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 h-96 bg-slate-100 border border-slate-200 rounded-2xl" />
            <div className="lg:col-span-7 h-96 bg-slate-100 border border-slate-200 rounded-2xl" />
          </div>
        </div>
      )}

      {/* State Error jika sensor tidak ditemukan */}
      {!isLoading && (loadError || !sensor) && (
        <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-4 shadow-sm my-10">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Perangkat Sensor Tidak Ditemukan</h3>
            <p className="text-xs text-slate-600">
              {loadError || 'Node sensor dengan ID tersebut tidak ditemukan di server atau Anda tidak memiliki akses ke perangkat ini.'}
            </p>
          </div>
          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => navigate('/kebun/sensors')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
            >
              Kembali ke Monitoring Sensor
            </Button>
          </div>
        </div>
      )}

      {/* Konten Utama Saat Sensor Siap */}
      {!isLoading && sensor && (
        <>
          {/* Banner Notifikasi Aksi Reset Pairing */}
          {feedback && (
            <div
              role="alert"
              className={`p-4 rounded-xl border flex items-start justify-between gap-3 shadow-2xs ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : feedback.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {feedback.type === 'success'
                      ? 'Berhasil'
                      : feedback.type === 'warning'
                      ? 'Peringatan'
                      : 'Terjadi Kesalahan'}
                  </div>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">
                    {feedback.message}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer shrink-0 p-1"
                aria-label="Tutup notifikasi"
              >
                ✕
              </button>
            </div>
          )}

          {/* Header Identitas Perangkat */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Cpu className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Konfigurasi IoT: {sensor.nodeCode}
                    </h1>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border-2 ${
                        isOnline
                          ? 'bg-white text-emerald-800 border-emerald-600'
                          : isNeverSeen
                          ? 'bg-white text-slate-700 border-slate-300'
                          : 'bg-white text-rose-800 border-rose-500'
                      }`}
                    >
                      {statusDisplay}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Parameter koneksi gateway ESP32 dan template konfigurasi YAML siap pakai untuk telemetri sensor.
                  </p>
                </div>
              </div>

              {/* Badges Lokasi Kebun & Sensor ID Copy Pill */}
              <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
                {(Boolean(sensor.farmName) || Boolean(sensor.blockName)) && (
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700">
                    {sensor.farmName || '--'} • {sensor.blockName || '--'}
                  </span>
                )}

                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800">
                  Lampu: {sensor.jumlah_lampu ?? 1} unit • {formatWattTerpasang(sensor.watt_terpasang)}
                </span>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
                  <span className="text-slate-500 font-sans font-semibold text-[11px]">ID:</span>
                  <span className="text-slate-800 font-bold select-all truncate max-w-[130px] sm:max-w-none">
                    {sensor.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopySensorId(sensor.id)}
                    className="text-slate-500 hover:text-emerald-700 cursor-pointer ml-0.5 p-0.5 rounded"
                    title="Salin Sensor ID"
                    aria-label="Salin Sensor ID"
                  >
                    {isCopiedId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Layout 2 Kolom: Parameter (Kiri) dan YAML Box (Kanan) */}
          <div className="bg-transparent">
            <SensorDeviceConfigView
              data={configData}
              layoutMode="grid"
              showDownloadButton={true}
              onResetPairing={() => {
                setResetDialogError(null);
                setIsResetDialogOpen(true);
              }}
              isResetting={isResetting}
            />
          </div>

          {/* Dialog Konfirmasi Reset Pairing */}
          <Modal
            isOpen={isResetDialogOpen}
            onClose={() => {
              if (!isResetting) {
                setIsResetDialogOpen(false);
                setResetDialogError(null);
              }
            }}
            title="Reset Pairing Gateway"
            maxWidth="md"
          >
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                Token lama akan tidak berlaku. Perangkat harus dipairing ulang memakai kode pairing baru. Lanjutkan?
              </p>

              {resetDialogError && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{resetDialogError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setIsResetDialogOpen(false);
                    setResetDialogError(null);
                  }}
                  disabled={isResetting}
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  onClick={handleConfirmReset}
                  isLoading={isResetting}
                  disabled={isResetting}
                >
                  Reset
                </Button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default SensorIotConfigPage;
