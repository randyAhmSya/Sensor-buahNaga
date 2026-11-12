import { useState, useEffect, useMemo, useCallback, type FC, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Cpu,
  Layers,
  Radio,
  Wifi,
  ChevronDown,
  Plus,
  Info,
  AlertCircle,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { gatewayService } from '@/services/gatewayService';
import { sensorService } from '@/services/sensorService';
import { blockService } from '@/services/blockService';
import { useFarmsWithBlocksQuery } from '@/hooks/queries/useFarmsQuery';
import { useSensorsQuery } from '@/hooks/queries/useSensorsQuery';
import { sensorKeys, blockKeys, farmKeys, gatewayKeys } from '@/services/queryKeys';
import { useNotify } from '@/context/NotificationContext';
import { useSaasMode } from '@/context/SaasContext';
import type { GatewayBackend } from '@/types/gateway.types';
import type { CreateNodePayload } from '@/types/node.types';
import type { SensorNodeItem } from '@/types/sensor.types';
import { containsMaliciousScript, XSS_ERROR_MESSAGE } from '@/utils/sanitize';
import { nodeSensorSchema } from '@/schemas/nodeSensor.schema';
import {
  buildGatewayCode,
  resolveKebunGateway,
  mapCreateGatewayError,
  mapCreateNodeError,
  isKebunAlreadyHasGatewayError,
} from '../utils/kebunGateway';
import {
  DEFAULT_SENSOR_TYPE,
  normalizeSensorType,
  SENSOR_TYPE_OPTIONS,
  type SensorType,
} from '@/constants/sensorType';

export const CreateSensorNodePage: FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const notify = useNotify();
  const { isSaasEnabled } = useSaasMode();

  // 1. Fetch data kebun dan blok secara reaktif
  const { data: farms = [], isLoading: isLoadingFarms } = useFarmsWithBlocksQuery();
  const activeFarmId = farms[0]?.id;

  // 2. Fetch seluruh sensor aktif untuk validasi 1 Blok = 1 Sensor (menggunakan cache bersama)
  const { data: existingSensors = [] } = useSensorsQuery(activeFarmId);

  // State Form
  const [selectedBlockId, setSelectedBlockId] = useState<string>('');
  const [kodePerangkat, setKodePerangkat] = useState<string>('');
  const [jumlahLampu, setJumlahLampu] = useState<number | string>(1);
  const [wattPerLampu, setWattPerLampu] = useState<string>('');
  const [tipeSensor, setTipeSensor] = useState<SensorType>(DEFAULT_SENSOR_TYPE);
  const [gateways, setGateways] = useState<GatewayBackend[]>([]);
  const [isLoadingGateways, setIsLoadingGateways] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscriptionError, setIsSubscriptionError] = useState<boolean>(false);

  // State Modal Buat Blok Baru Cepat (jika seluruh blok sudah terpasang sensor)
  const [isQuickBlockOpen, setIsQuickBlockOpen] = useState<boolean>(false);
  const [quickFarmId, setQuickFarmId] = useState<string>('');
  const [quickBlockName, setQuickBlockName] = useState<string>('');
  const [quickBlockArea, setQuickBlockArea] = useState<string>('');
  const [isSubmittingQuickBlock, setIsSubmittingQuickBlock] = useState<boolean>(false);
  const [quickBlockError, setQuickBlockError] = useState<string | null>(null);

  // Mapping ID blok ke kode node yang sudah aktif (Validasi 1 Blok = 1 Sensor)
  const assignedBlockMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of existingSensors) {
      if (s.blockId) {
        const bId = String(s.blockId).trim();
        map[bId] = s.nodeCode || 'Aktif';
      }
    }
    return map;
  }, [existingSensors]);

  // Cari informasi kebun & blok terpilih untuk ringkasan real-time
  const selectedDetails = useMemo(() => {
    if (!selectedBlockId) {
      return { farmName: '', blockName: '', farmId: '', blockIds: [] as string[] };
    }
    for (const f of farms) {
      const matchedBlock = (f.blocks || []).find((b) => {
        const bId = ((b as unknown as { id_blok?: string }).id_blok ?? b.id) as string | undefined;
        return String(bId) === String(selectedBlockId);
      });
      if (matchedBlock) {
        const blockIds = (f.blocks || [])
          .map((b) => (((b as unknown as { id_blok?: string }).id_blok ?? b.id) as string) || '')
          .filter(Boolean);
        return {
          farmName: f.name,
          farmId: f.id,
          blockName: matchedBlock.name,
          blockIds,
        };
      }
    }
    return { farmName: '', blockName: '', farmId: '', blockIds: [] as string[] };
  }, [farms, selectedBlockId]);

  // Load gateway saat kebun terpilih berubah (1 kebun = 1 gateway)
  const loadGatewaysForKebun = useCallback(
    async (farmId: string) => {
      const cleanId = farmId.trim();
      if (!cleanId) {
        setGateways([]);
        setIsLoadingGateways(false);
        return;
      }

      setIsLoadingGateways(true);
      try {
        const data = await gatewayService.getAllByKebun(cleanId);
        setGateways(data || []);
      } catch {
        setGateways([]);
      } finally {
        setIsLoadingGateways(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedDetails.farmId) {
      loadGatewaysForKebun(selectedDetails.farmId);
    } else {
      setGateways([]);
    }
  }, [selectedDetails.farmId, loadGatewaysForKebun]);

  // Resolusi gateway kebun secara deterministik (1 kebun = 1 gateway)
  const kebunGateway = useMemo(() => {
    if (!selectedDetails.farmId || gateways.length === 0) return null;
    return resolveKebunGateway(gateways, selectedDetails.farmId, selectedDetails.blockIds);
  }, [gateways, selectedDetails.farmId, selectedDetails.blockIds]);

  // Handler pembuatan blok cepat
  const handleQuickBlockSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setQuickBlockError(null);

    if (!quickFarmId.trim()) {
      setQuickBlockError('Pilih kebun tempat blok akan dibuat.');
      return;
    }
    if (!quickBlockName.trim()) {
      setQuickBlockError('Nama blok wajib diisi.');
      return;
    }

    setIsSubmittingQuickBlock(true);
    try {
      const createdBlock = await blockService.create(quickFarmId.trim(), {
        name: quickBlockName.trim(),
        description: 'Blok perkebunan buah naga',
        area: quickBlockArea ? quickBlockArea.trim() : '0',
        status: 'Belum Terpasang',
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.withBlocks(), refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: blockKeys.all, refetchType: 'all' }),
      ]);

      const newBlockId = createdBlock.id || '';
      if (newBlockId) {
        setSelectedBlockId(newBlockId);
      }

      notify.success('Blok Dibuat', `Blok ${quickBlockName.trim()} berhasil ditambahkan.`);
      setIsQuickBlockOpen(false);
      setQuickBlockName('');
      setQuickBlockArea('');
    } catch (err: unknown) {
      setQuickBlockError((err as Error)?.message || 'Gagal menambahkan blok baru.');
    } finally {
      setIsSubmittingQuickBlock(false);
    }
  };

  // Submit Registrasi Node Sensor
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubscriptionError(false);
    setError(null);

    if (containsMaliciousScript(kodePerangkat) || containsMaliciousScript(tipeSensor)) {
      setError(XSS_ERROR_MESSAGE);
      return;
    }

    if (!selectedBlockId.trim()) {
      setError('Penempatan Blok Lahan wajib dipilih.');
      return;
    }

    const assignedNode = assignedBlockMap[selectedBlockId.trim()];
    if (assignedNode) {
      setError(`Blok lahan ini sudah memiliki node sensor aktif (${assignedNode}). Satu blok hanya dapat dipasangkan dengan satu node sensor.`);
      return;
    }

    if (!kodePerangkat.trim()) {
      setError('Kode Perangkat Node Sensor wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    let createdGwInCurrentAttempt: GatewayBackend | null = null;

    try {
      let resolvedGatewayId = '';
      let resolvedGatewayCode = '';
      let resolvedPairingCode = '';

      if (kebunGateway) {
        resolvedGatewayId = kebunGateway.id_gateway || kebunGateway.id || '';
        resolvedGatewayCode = kebunGateway.kode_perangkat;
        resolvedPairingCode = kebunGateway.kode_pairing || '';
      } else {
        // Mode otomatis: Jika kebun belum punya gateway, buat SATU gateway deterministik baru
        const candidateCode = buildGatewayCode(kodePerangkat);
        let createdGw: GatewayBackend | null = null;

        try {
          const gwRes = await gatewayService.create({
            blok_id: selectedBlockId.trim(),
            kode_perangkat: candidateCode,
            status_koneksi: 'belum_terhubung',
          });

          const resObj = gwRes as unknown as Record<string, unknown>;
          const resData = (resObj?.data as Record<string, unknown>)?.data || resObj?.data || resObj;
          const resDataTyped = resData as Record<string, unknown>;
          const newGwId = String(resDataTyped?.id_gateway || resDataTyped?.id || '');

          if (!newGwId) {
            throw new Error('Server tidak mengembalikan ID gateway valid.');
          }

          createdGw = {
            id_gateway: newGwId,
            blok_id: selectedBlockId.trim(),
            kode_perangkat: String(resDataTyped?.kode_perangkat || candidateCode),
            status_koneksi: String(resDataTyped?.status_koneksi || 'belum_terhubung'),
            kode_pairing: String(resDataTyped?.kode_pairing || ''),
          };

          // Invalidasi cache gateway segera setelah pembuatan berhasil
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: gatewayKeys.all }),
            selectedDetails.farmId
              ? queryClient.invalidateQueries({ queryKey: gatewayKeys.list(selectedDetails.farmId) })
              : Promise.resolve(),
          ]);
        } catch (gwErr: unknown) {
          // Koreksi 2: Balapan dua tab atau dua pengguna (HTTP 422: Kebun ini sudah memiliki gateway)
          if (isKebunAlreadyHasGatewayError(gwErr) && selectedDetails.farmId) {
            const refetched = await gatewayService.getAllByKebun(selectedDetails.farmId);
            const recovered = resolveKebunGateway(refetched, selectedDetails.farmId, selectedDetails.blockIds);
            if (recovered && (recovered.id_gateway || recovered.id)) {
              createdGw = recovered;
            } else {
              throw new Error(mapCreateGatewayError(gwErr));
            }
          } else {
            throw new Error(mapCreateGatewayError(gwErr));
          }
        }

        if (createdGw) {
          createdGwInCurrentAttempt = createdGw;
          resolvedGatewayId = createdGw.id_gateway || createdGw.id || '';
          resolvedGatewayCode = createdGw.kode_perangkat;
          resolvedPairingCode = createdGw.kode_pairing || '';
        }
      }

      if (!resolvedGatewayId) {
        setError('Gagal menyiapkan Gateway IoT untuk kebun ini.');
        setIsSubmitting(false);
        return;
      }

      const parsedJumlah = parseInt(String(jumlahLampu), 10);
      const parsedWatt =
        wattPerLampu.trim() === '' ? null : parseFloat(wattPerLampu);

      // Validasi skema Zod
      const validation = nodeSensorSchema.safeParse({
        kode_perangkat: kodePerangkat.trim(),
        blok_id: selectedBlockId.trim(),
        gateway_id: resolvedGatewayId,
        tipe_sensor: normalizeSensorType(tipeSensor),
        status_koneksi: 'aktif',
        jumlah_lampu: isNaN(parsedJumlah) ? 1 : parsedJumlah,
        watt_per_lampu: parsedWatt,
      });

      if (!validation.success) {
        const firstIssue = validation.error.issues[0];
        let msg = firstIssue.message;
        if (firstIssue.path.includes('kode_perangkat')) {
          msg = 'Kode Perangkat: ' + firstIssue.message;
        } else if (firstIssue.path.includes('jumlah_lampu')) {
          msg = 'Jumlah Lampu: ' + firstIssue.message;
        } else if (firstIssue.path.includes('watt_per_lampu')) {
          msg = 'Daya per Lampu: ' + firstIssue.message;
        }
        setError(msg);
        setIsSubmitting(false);
        return;
      }

      // Payload pembuatan node sensor di backend
      const effectiveJumlahLampu = !isNaN(parsedJumlah) && parsedJumlah >= 1 ? parsedJumlah : 1;
      const payload: CreateNodePayload = {
        kode_perangkat: kodePerangkat.trim(),
        blok_id: selectedBlockId.trim(),
        gateway_id: resolvedGatewayId,
        tipe_sensor: normalizeSensorType(tipeSensor),
        status_koneksi: 'offline',
        jumlah_lampu: effectiveJumlahLampu,
        watt_per_lampu: parsedWatt,
      };

      const res = await sensorService.create(payload);

      // Dapatkan ID sensor baru (UUID)
      const resObj = res as unknown as Record<string, unknown>;
      const possibleData =
        (resObj?.data as Record<string, unknown>)?.data || resObj?.data || resObj;
      const newSensorId = String(
        (possibleData as Record<string, unknown>)?.id_sensor ||
        (possibleData as Record<string, unknown>)?.id ||
        ''
      );

      if (!newSensorId) {
        throw new Error('Server tidak mengembalikan ID sensor valid.');
      }

      // Invalidate TanStack Query caches
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sensorKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['nodes'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: blockKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['kebun'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.all, refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: farmKeys.withBlocks(), refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: gatewayKeys.all, refetchType: 'all' }),
      ]);

      notify.success('Registrasi Berhasil', `Node sensor ${kodePerangkat.trim()} berhasil didaftarkan.`);

      // Siapkan payload SensorNodeItem lengkap untuk instant rendering di halaman Konfigurasi IoT
      const calculatedWattTerpasang =
        parsedWatt !== null && !isNaN(effectiveJumlahLampu)
          ? Math.round(effectiveJumlahLampu * parsedWatt * 100) / 100
          : null;

      const sensorPayload: SensorNodeItem = {
        id: newSensorId,
        nodeCode: kodePerangkat.trim(),
        farmId: selectedDetails.farmId || '',
        farmName: selectedDetails.farmName || '',
        blockId: selectedBlockId.trim(),
        blockName: selectedDetails.blockName || '',
        status: 'Offline',
        luxLevel: 0,
        temperature: 0,
        lastSeen: 'Belum ada data',
        sparklineData: [],
        gatewayCode: resolvedGatewayCode,
        kodePairing: resolvedPairingCode,
        pairingCode: resolvedPairingCode,
        tokenGateway: '',
        jumlah_lampu: effectiveJumlahLampu,
        watt_per_lampu: parsedWatt,
        watt_terpasang: calculatedWattTerpasang,
      };

      // Redirect langsung ke halaman Konfigurasi IoT
      navigate(`/kebun/sensors/${newSensorId}/iot-config`, {
        replace: true,
        state: { sensor: sensorPayload },
      });
    } catch (err: unknown) {
      const mappedMsg = mapCreateNodeError(err, isSaasEnabled);
      if (createdGwInCurrentAttempt) {
        // Koreksi 5: Gateway sudah terbuat tapi registrasi node gagal
        setError(
          `Gateway IoT ${createdGwInCurrentAttempt.kode_perangkat} berhasil didaftarkan di kebun ini, namun registrasi node sensor gagal: ${mappedMsg}. Gateway tersebut sudah tersimpan dan dapat langsung digunakan pada penyimpanan berikutnya.`
        );
      } else {
        setError(mappedMsg);
      }
      if (err && typeof err === 'object') {
        const errObj = err as Record<string, unknown>;
        const status = (errObj.status || (errObj.response as Record<string, unknown>)?.status) as number;
        if (status === 403 && isSaasEnabled) {
          setIsSubscriptionError(true);
        }
      }
      notify.error('Registrasi Gagal', mappedMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb Navigasi Kembali */}
      <div>
        <Link
          to="/kebun/sensors"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Kembali ke Monitoring Sensor</span>
        </Link>
      </div>

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Tambah Node Sensor Baru
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftarkan perangkat node IoT baru untuk memantau intensitas cahaya lux dan kondisi lingkungan blok lahan.
          </p>
        </div>
      </div>

      {/* Grid Utama 12 Kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri / Formulir Utama (8 Kolom) */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-6 text-left">
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold space-y-1.5 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>{error}</p>
                  {isSubscriptionError && isSaasEnabled && (
                    <div>
                      <Link
                        to="/kebun/langganan"
                        className="inline-flex items-center text-xs font-bold text-emerald-700 underline hover:text-emerald-800"
                      >
                        Buka Halaman Langganan
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SEKSI 1: PENEMPATAN BLOK LAHAN */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="select-blok-lahan"
                  className="block text-xs font-bold text-slate-900 uppercase tracking-wider"
                >
                  1. Penempatan Blok Lahan <span className="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsQuickBlockOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Blok Baru</span>
                </button>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Layers className="w-4 h-4" />
                </div>
                <select
                  id="select-blok-lahan"
                  value={selectedBlockId}
                  onChange={(e) => {
                    setSelectedBlockId(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                  disabled={isLoadingFarms}
                  className="block w-full appearance-none rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-3 text-sm font-medium text-slate-900 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer shadow-2xs"
                >
                  <option value="">
                    {isLoadingFarms ? 'Memuat data kebun & blok...' : 'Pilih Blok Lahan Perkebunan'}
                  </option>
                  {farms.map((farm) => (
                    <optgroup key={farm.id} label={farm.name}>
                      {(farm.blocks || []).map((b) => {
                        const assignedNode = assignedBlockMap[b.id];
                        const isAssigned = Boolean(assignedNode);
                        const bName = b.name.trim();
                        const formattedBlockName = bName.toLowerCase().startsWith('blok') ? bName : `Blok ${bName}`;
                        return (
                          <option
                            key={b.id}
                            value={b.id}
                            disabled={isAssigned}
                            className={isAssigned ? 'text-slate-400 bg-slate-50 italic' : ''}
                          >
                            {farm.name} - {formattedBlockName} {isAssigned ? `(Sudah ada: ${assignedNode})` : ''}
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Aturan sistem: Satu blok lahan hanya dapat dipasangkan dengan satu unit node sensor. Jika seluruh blok sudah terpasang, gunakan tombol "Buat Blok Baru" di atas.
              </p>
            </div>

            {/* SEKSI 2: GATEWAY IOT (1 KEBUN 1 GATEWAY) */}
            {selectedBlockId && (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-emerald-700 shrink-0" />
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                    2. Gateway Penghubung IoT
                  </label>
                  {isLoadingGateways && (
                    <span className="text-[11px] text-slate-400 italic">Memeriksa gateway kebun...</span>
                  )}
                </div>

                {kebunGateway ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        Gateway IoT Kebun Terhubung
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        1 Kebun 1 Gateway
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {kebunGateway.kode_perangkat}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700">
                        {kebunGateway.status_koneksi === 'terhubung' ? 'Terhubung' : 'Belum Terhubung'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Node sensor pada blok ini akan otomatis terhubung ke Gateway IoT kebun ini ({selectedDetails.farmName || 'Kebun'}).
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                        Kebun Belum Memiliki Gateway
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Otomatis Dibuat
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-normal">
                      Sesuai aturan arsitektur sistem, satu kebun hanya boleh memiliki satu gateway. Karena kebun ini belum memiliki gateway, sistem akan mendaftarkan 1 Gateway IoT otomatis ({buildGatewayCode(kodePerangkat || 'NODE')}) saat node sensor disimpan.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* SEKSI 3: IDENTITAS PERANGKAT NODE */}
            <div className="space-y-4 pt-3 border-t border-slate-100">
              <label
                htmlFor="input-kode-perangkat"
                className="block text-xs font-bold text-slate-900 uppercase tracking-wider"
              >
                3. Identitas Perangkat Node Sensor <span className="text-rose-600 font-bold ml-0.5">*</span>
              </label>

              <div className="space-y-1.5">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Radio className="w-4 h-4" />
                  </div>
                  <input
                    id="input-kode-perangkat"
                    name="kodePerangkat"
                    type="text"
                    value={kodePerangkat}
                    onChange={(e) => {
                      setKodePerangkat(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Contoh: ESP32-BLOK-A1"
                    required
                    maxLength={50}
                    className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-colors shadow-2xs"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Gunakan kode unik untuk memudahkan identifikasi perangkat fisik di kebun buah naga.
                </p>
              </div>

              {/* Tipe Sensor Dropdown */}
              <div className="space-y-1.5">
                <label
                  htmlFor="select-tipe-sensor"
                  className="block text-xs font-semibold text-slate-800"
                >
                  Tipe Pengukuran Sensor <span className="text-rose-600 font-bold ml-0.5">*</span>
                </label>
                <div className="relative">
                  <select
                    id="select-tipe-sensor"
                    value={tipeSensor}
                    onChange={(e) => setTipeSensor(normalizeSensorType(e.target.value))}
                    disabled={isSubmitting}
                    className="block w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-colors shadow-2xs pr-10 cursor-pointer"
                  >
                    {SENSOR_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Pilih spesifikasi kemampuan telemetri modul sensor IoT.
                </p>
              </div>

              {/* Jumlah Lampu & Watt per Lampu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label
                    htmlFor="input-jumlah-lampu"
                    className="block text-xs font-semibold text-slate-800"
                  >
                    Jumlah Lampu Dikendalikan <span className="text-rose-600 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    id="input-jumlah-lampu"
                    name="jumlahLampu"
                    type="number"
                    min={1}
                    max={10000}
                    value={jumlahLampu}
                    onChange={(e) => {
                      setJumlahLampu(e.target.value);
                      if (error) setError(null);
                    }}
                    required
                    className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-colors shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Jumlah unit fisik lampu (default 1).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="input-watt-per-lampu"
                    className="block text-xs font-semibold text-slate-800"
                  >
                    Daya per Lampu (Watt)
                  </label>
                  <input
                    id="input-watt-per-lampu"
                    name="wattPerLampu"
                    type="number"
                    step="any"
                    min={0}
                    max={5000}
                    value={wattPerLampu}
                    onChange={(e) => {
                      setWattPerLampu(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Contoh: 15 (opsional)"
                    className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-colors shadow-2xs"
                  />
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Kosongkan jika belum diketahui.
                  </p>
                </div>
              </div>

              {/* Ringkasan Estimasi Total Beban Daya */}
              {wattPerLampu.trim() !== '' && !isNaN(parseFloat(wattPerLampu)) && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-900">Estimasi Beban Daya Total:</span>
                  <span className="font-bold text-emerald-800">
                    {Math.round((parseInt(String(jumlahLampu), 10) || 1) * parseFloat(wattPerLampu) * 100) / 100} W
                  </span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => navigate('/kebun/sensors')}
                disabled={isSubmitting}
                className="w-full sm:w-auto cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting || !selectedBlockId.trim() || !kodePerangkat.trim()}
                isLoading={isSubmitting}
                leftIcon={<Plus className="w-4 h-4" />}
                className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer shadow-xs py-2.5 px-6 rounded-xl"
              >
                Simpan & Daftarkan Node
              </Button>
            </div>
          </form>
        </div>

        {/* Kolom Kanan / Ringkasan Real-time (4 Kolom) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Kartu Ringkasan Real-time */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 text-left">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Cpu className="w-4 h-4 text-emerald-700 shrink-0" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Ringkasan Registrasi
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-500 font-medium">Kebun:</span>
                <span className="font-semibold text-slate-900 text-right">
                  {selectedDetails.farmName || '-'}
                </span>
              </div>

              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-500 font-medium">Blok Lahan:</span>
                <span className="font-semibold text-slate-900 text-right">
                  {selectedDetails.blockName || '-'}
                </span>
              </div>

              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-500 font-medium">Kode Perangkat:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-right">
                  {kodePerangkat.trim() || '-'}
                </span>
              </div>

              <div className="flex justify-between items-start gap-2 pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Gateway IoT:</span>
                <span className="font-semibold text-slate-800 text-right">
                  {kebunGateway
                    ? kebunGateway.kode_perangkat
                    : 'Dibuat Otomatis (GTW-*)'}
                </span>
              </div>

              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-500 font-medium">Kode Pairing:</span>
                <span className="font-mono font-bold text-emerald-800 text-right">
                  {kebunGateway
                    ? kebunGateway.kode_pairing || '--'
                    : 'Akan Digenerate'}
                </span>
              </div>
            </div>
          </div>

          {/* Kartu Informasi Alur Pendaftaran */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-3.5 text-left">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-700 shrink-0" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Alur Pendaftaran IoT
              </h4>
            </div>

            <ol className="space-y-2.5 text-xs text-slate-600 leading-relaxed list-decimal pl-4">
              <li>
                <strong className="text-slate-800">Pilih Blok Lahan</strong>: Tentukan penempatan node di perkebunan buah naga.
              </li>
              <li>
                <strong className="text-slate-800">Gateway IoT</strong>: Berfungsi sebagai penerima paket telemetri sebelum diteruskan ke broker server.
              </li>
              <li>
                <strong className="text-slate-800">Halaman Konfigurasi IoT</strong>: Setelah disimpan, sistem langsung mengarahkan Anda ke halaman parameter siap salin beserta blok kode YAML untuk ESP32.
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Modal Buat Blok Baru Cepat */}
      {isQuickBlockOpen && (
        <Modal
          isOpen={isQuickBlockOpen}
          onClose={() => setIsQuickBlockOpen(false)}
          title="Buat Blok Lahan Baru"
          description="Tambahkan blok lahan baru pada kebun terpilih agar dapat dipasangkan dengan node sensor."
          maxWidth="md"
        >
          <form onSubmit={handleQuickBlockSubmit} className="space-y-4 pt-1 text-left">
            {quickBlockError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {quickBlockError}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="quick-select-farm" className="block text-xs font-semibold text-slate-800">
                Pilih Kebun <span className="text-rose-600 font-bold ml-0.5">*</span>
              </label>
              <select
                id="quick-select-farm"
                value={quickFarmId}
                onChange={(e) => setQuickFarmId(e.target.value)}
                required
                className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-900 transition-colors hover:border-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="">Pilih Kebun</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="quick-input-block-name" className="block text-xs font-semibold text-slate-800">
                Nama Blok Lahan <span className="text-rose-600 font-bold ml-0.5">*</span>
              </label>
              <input
                id="quick-input-block-name"
                type="text"
                value={quickBlockName}
                onChange={(e) => setQuickBlockName(e.target.value)}
                placeholder="Contoh: Blok 12"
                required
                className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="quick-input-block-area" className="block text-xs font-semibold text-slate-800">
                Luas Area (Hektar, Opsional)
              </label>
              <input
                id="quick-input-block-area"
                type="number"
                step="0.01"
                min="0"
                value={quickBlockArea}
                onChange={(e) => setQuickBlockArea(e.target.value)}
                placeholder="Contoh: 1.5"
                className="block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsQuickBlockOpen(false)}
                disabled={isSubmittingQuickBlock}
                className="cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmittingQuickBlock || !quickFarmId || !quickBlockName.trim()}
                isLoading={isSubmittingQuickBlock}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer shadow-xs"
              >
                Simpan Blok
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CreateSensorNodePage;

