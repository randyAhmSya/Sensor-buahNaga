import { useState, useId, type FC } from 'react';
import { Copy, Check, Terminal, FileCode, Server, Cpu, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  generateFullIotYaml,
  generateItemDeviceYaml,
  getGatewayPairingState,
  resolvePetaniBaseUrl,
  type SensorDeviceConfigData,
} from '../utils/iotConfigYamlMapper';

export type { SensorDeviceConfigData } from '../utils/iotConfigYamlMapper';

interface SensorDeviceConfigViewProps {
  data: SensorDeviceConfigData;
  layoutMode?: 'stacked' | 'grid';
  showDownloadButton?: boolean;
  onResetPairing?: () => void;
  isResetting?: boolean;
}

export const SensorDeviceConfigView: FC<SensorDeviceConfigViewProps> = ({
  data,
  layoutMode = 'stacked',
  showDownloadButton = false,
  onResetPairing,
  isResetting = false,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [yamlCopiedMode, setYamlCopiedMode] = useState<'full' | 'item' | null>(null);
  const uniquePrefix = useId();

  const baseUrl = resolvePetaniBaseUrl(data.base_url);
  const intervalDetik = data.interval_detik ?? 10;
  const jumlahKirim = data.jumlah_kirim ?? 0;
  const protokol = data.protokol || 'mqtt';
  const mqttHost = data.mqtt_host || '127.0.0.1';
  const mqttPort = data.mqtt_port ?? 1883;

  const pairingState = getGatewayPairingState(data.kode_gateway, data.kode_pairing);
  const isPairingActive = pairingState === 'menunggu_pairing';
  const isPaired = pairingState === 'sudah_dipasangkan';
  const hasGateway = Boolean(data.kode_gateway && data.kode_gateway.trim());

  let kodePairingDisplay = 'Tampil saat gateway dibuat';
  let isPairingCopyable = false;

  if (isPairingActive && data.kode_pairing) {
    kodePairingDisplay = data.kode_pairing;
    isPairingCopyable = true;
  } else if (isPaired) {
    kodePairingDisplay =
      'Gateway sudah dipasangkan. Gunakan token yang dicetak perangkat saat pairing. Jika hilang, pairing perlu direset.';
    isPairingCopyable = false;
  }

  // Template YAML dari utilitas murni teruji
  const itemDeviceYaml = generateItemDeviceYaml(data);
  const fullYaml = generateFullIotYaml(data);

  const copyToClipboard = async (text: string, key: string, isYamlMode?: 'full' | 'item') => {
    if (!text) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      if (isYamlMode) {
        setYamlCopiedMode(isYamlMode);
        setTimeout(() => setYamlCopiedMode(null), 2500);
      } else {
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2500);
      }
    } catch {
      // Fallback diam jika clipboard permission ditolak browser
    }
  };

  const handleDownloadYaml = () => {
    try {
      const blob = new Blob([fullYaml], { type: 'text/yaml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const targetCode = data.kode_gateway || data.kode_node;
      const safeFileName = targetCode
        ? `config-${targetCode.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.yml`
        : 'config-sensor.yml';
      link.download = safeFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback jika blob download ditolak
    }
  };

  const deviceFields = [
    {
      key: 'nama',
      label: 'Nama Blok Lahan',
      value: data.nama,
      display: data.nama,
      isMono: false,
      isCopyable: true,
      highlight: false,
      placeholder: false,
    },
    {
      key: 'sensor_id',
      label: 'Sensor ID (UUID)',
      value: data.sensor_id,
      display: data.sensor_id,
      isMono: true,
      highlight: true,
      isCopyable: true,
      placeholder: false,
    },
    {
      key: 'kode_node',
      label: 'Kode Node',
      value: data.kode_node,
      display: data.kode_node || '(Belum ada kode node)',
      isMono: true,
      highlight: false,
      isCopyable: Boolean(data.kode_node),
      placeholder: !data.kode_node,
    },
    {
      key: 'kode_gateway',
      label: 'Kode Gateway',
      value: data.kode_gateway || '',
      display: hasGateway ? data.kode_gateway! : 'Belum terhubung ke gateway',
      isMono: hasGateway,
      highlight: hasGateway,
      isCopyable: hasGateway,
      placeholder: !hasGateway,
    },
    {
      key: 'kode_pairing',
      label: 'Kode Pairing ESP32',
      value: isPairingActive ? data.kode_pairing || '' : '',
      display: kodePairingDisplay,
      isMono: isPairingActive,
      highlight: isPairingActive,
      isCopyable: isPairingCopyable,
      placeholder: !isPairingActive,
    },
    {
      key: 'token_gateway',
      label: 'Token Gateway',
      value: '',
      display: 'Disimpan aman di server (hanya dicetak sekali oleh perangkat saat pairing)',
      isMono: false,
      highlight: false,
      isCopyable: false,
      placeholder: true,
    },
  ];

  const serverFields = [
    { key: 'base_url', label: 'Base URL API', value: baseUrl },
    { key: 'protokol', label: 'Protokol Kirim', value: protokol },
    { key: 'mqtt_host', label: 'MQTT Host', value: mqttHost },
    { key: 'mqtt_port', label: 'MQTT Port', value: String(mqttPort) },
    { key: 'interval_detik', label: 'Interval Telemetri', value: `${intervalDetik}s` },
    { key: 'jumlah_kirim', label: 'Jumlah Kirim', value: jumlahKirim === 0 ? '0 (Loop Kontinu)' : String(jumlahKirim) },
  ];

  // Bagian 1: Parameter Perangkat & Server
  const parameterSection = (
    <div className="space-y-4">
      {/* Parameter Perangkat */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-700 shrink-0" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              1. Parameter Perangkat Node & Pairing
            </h4>
          </div>
          {onResetPairing && hasGateway && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetPairing}
              disabled={isResetting}
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-600" />}
              className="text-xs font-semibold cursor-pointer"
            >
              Reset Pairing
            </Button>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-2xs overflow-hidden">
          {deviceFields.map((field) => {
            const isCopied = copiedKey === field.key;
            const canCopy = field.isCopyable && Boolean(field.value);

            return (
              <div
                key={field.key}
                className="p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {field.label}
                  </div>
                  <div
                    className={`mt-0.5 text-xs sm:text-sm font-semibold break-all select-all ${
                      field.isMono ? 'font-mono' : ''
                    } ${
                      field.placeholder
                        ? 'text-slate-500 font-normal italic'
                        : field.highlight
                        ? 'text-emerald-950 font-bold'
                        : 'text-slate-800'
                    }`}
                  >
                    {field.display}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => canCopy && copyToClipboard(field.value, field.key)}
                  disabled={!canCopy}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 border ${
                    !canCopy
                      ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-70'
                      : isCopied
                      ? 'border-emerald-700 bg-emerald-700 text-white cursor-pointer'
                      : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700 active:scale-95 cursor-pointer'
                  }`}
                  aria-label={`Salin ${field.label}`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Parameter Server & Koneksi */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Server className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
            Konfigurasi Server & Koneksi
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {serverFields.map((field) => {
            const isCopied = copiedKey === field.key;
            return (
              <div
                key={field.key}
                className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between gap-1.5"
              >
                <div className="min-w-0">
                  <span className="block text-[10px] text-slate-500 font-medium truncate">
                    {field.label}
                  </span>
                  <span className="block font-mono text-xs font-bold text-slate-800 truncate select-all">
                    {field.value}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(field.value, field.key)}
                  className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/80 transition-colors shrink-0 cursor-pointer"
                  title={`Salin ${field.label}`}
                >
                  {isCopied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Bagian 2: Blok Kode YAML Siap Pakai
  const yamlSection = (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-800 shrink-0" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            2. Konfigurasi YAML IoT
          </h4>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Tombol Unduh .yml */}
          {showDownloadButton && (
            <button
              type="button"
              onClick={handleDownloadYaml}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-emerald-700 bg-white hover:bg-emerald-50 text-emerald-800 active:scale-95"
              title="Unduh berkas konfigurasi .yml"
            >
              <Download className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
              <span>Unduh .yml</span>
            </button>
          )}

          {/* Tombol Salin Item Device */}
          <button
            type="button"
            onClick={() => copyToClipboard(itemDeviceYaml, `yaml-item-${uniquePrefix}`, 'item')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
              yamlCopiedMode === 'item'
                ? 'border-emerald-700 bg-emerald-700 text-white'
                : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800 active:scale-95'
            }`}
          >
            {yamlCopiedMode === 'item' ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Item Tersalin!</span>
              </>
            ) : (
              <>
                <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                <span>Salin Item Device</span>
              </>
            )}
          </button>

          {/* Tombol Salin Full YAML */}
          <button
            type="button"
            onClick={() => copyToClipboard(fullYaml, `yaml-full-${uniquePrefix}`, 'full')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
              yamlCopiedMode === 'full'
                ? 'border-emerald-700 bg-emerald-700 text-white'
                : 'border-slate-900 bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
            }`}
          >
            {yamlCopiedMode === 'full' ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Full YAML Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 shrink-0 text-white" />
                <span>Salin Full YAML</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monospaced YAML Box Kontras Tinggi */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 font-mono text-xs overflow-x-auto select-all leading-relaxed shadow-sm">
        <pre className="whitespace-pre">{fullYaml}</pre>
      </div>

      <p className="text-[11px] text-slate-500 leading-normal">
        Tempelkan konfigurasi di atas ke file config perangkat gateway ESP32 atau gunakan kode pairing untuk menghubungkan firmware asli.
      </p>
    </div>
  );

  if (layoutMode === 'grid') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
        <div className="lg:col-span-5 space-y-6">
          {parameterSection}
        </div>
        <div className="lg:col-span-7 space-y-4">
          {yamlSection}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-left">
      {parameterSection}
      <div className="pt-2 border-t border-slate-200">
        {yamlSection}
      </div>
    </div>
  );
};
