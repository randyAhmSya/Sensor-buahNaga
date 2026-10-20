import { useState, useRef, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Thermometer, MoreVertical, Pencil, Trash2, QrCode } from 'lucide-react';
import type { SensorNodeItem } from '@/types/sensor.types';
import { RegenerateQrConfirmModal } from './RegenerateQrConfirmModal';

interface SensorNodeCardProps {
  sensor: SensorNodeItem;
  onEdit?: (sensor: SensorNodeItem) => void;
  onDelete?: (sensor: SensorNodeItem) => void;
}

export const SensorNodeCard: FC<SensorNodeCardProps> = ({
  sensor,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const isOnline =
    sensor.status?.toLowerCase() === 'aktif' ||
    sensor.status?.toLowerCase() === 'online';
  const displayStatus = isOnline ? 'Aktif' : 'Nonaktif';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegenerateQrOpen, setIsRegenerateQrOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      onClick={() => {
        const targetBlockId = sensor.blockId || '';
        const targetFarmId = sensor.farmId || '';
        if (targetFarmId && targetBlockId) {
          navigate(`/kebun/farms/${targetFarmId}/blocks/${targetBlockId}`);
        } else if (targetBlockId) {
          navigate(`/kebun/blocks/${targetBlockId}`);
        } else {
          navigate('/kebun/sensors');
        }
      }}
      className={`bg-white rounded-2xl p-5 border transition-all duration-200 cursor-pointer shadow-2xs group flex flex-col justify-between active:scale-[0.99] ${
        isOnline
          ? 'border-slate-200/90 hover:border-emerald-600 hover:shadow-md'
          : 'border-slate-200/90 bg-slate-50/50 hover:border-rose-400 opacity-95'
      }`}
    >
      <div>
        <div className="flex justify-between items-start gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
              {sensor.nodeCode}
            </h3>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
              <span className="truncate max-w-[130px]">{sensor.farmName}</span>
              <span className="text-slate-300">•</span>
              <span className="font-semibold text-slate-700 truncate max-w-[110px]">{sensor.blockName}</span>
              {sensor.gatewayCode && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="inline-flex items-center gap-1.5 text-slate-500 whitespace-nowrap">
                    <span>GW: <strong className="text-slate-700 font-semibold">{sensor.gatewayCode}</strong></span>
                    {sensor.gatewayStatus && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                          sensor.gatewayStatus.toLowerCase() === 'terhubung'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {sensor.gatewayStatus.toLowerCase() === 'terhubung' ? 'Terhubung' : 'Belum Terhubung'}
                      </span>
                    )}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 shadow-2xs ${
                isOnline
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50/80 border-rose-200 text-rose-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-600' : 'bg-rose-500'}`} />
              {displayStatus}
            </span>

            {/* Menu Aksi Titik Tiga dengan Touch Target Nyaman */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen((prev) => !prev);
                }}
                className="w-11 h-11 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                aria-label="Opsi sensor"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-30 animate-in fade-in duration-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onEdit?.(sensor);
                    }}
                    className="w-full px-3.5 py-2.5 min-h-[40px] text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Pencil className="w-4 h-4 text-slate-400" />
                    <span>Edit Sensor</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      setIsRegenerateQrOpen(true);
                    }}
                    className="w-full px-3.5 py-2.5 min-h-[40px] text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 flex items-center gap-2.5 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-slate-400" />
                    <span>Buat Ulang QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onDelete?.(sensor);
                    }}
                    className="w-full px-3.5 py-2.5 min-h-[40px] text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span>Hapus Node</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metrik Sensor: Lux & Suhu dengan Angka Kontras Tinggi */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-50 border border-slate-100/90 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
              <Sun className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Intensitas Lux</span>
            </div>
            <p className={`text-lg sm:text-xl font-bold tracking-tight ${isOnline ? 'text-slate-900' : 'text-slate-400'}`}>
              {isOnline ? `${sensor.luxLevel.toLocaleString('id-ID')} lx` : '0 lx'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100/90 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
              <Thermometer className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Suhu Udara</span>
            </div>
            <p className={`text-lg sm:text-xl font-bold tracking-tight ${isOnline ? 'text-slate-900' : 'text-slate-400'}`}>
              {isOnline ? `${sensor.temperature} °C` : '0 °C'}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Telemetri terhubung</span>
        <span className="font-medium">Terakhir sinkron: {sensor.lastSeen}</span>
      </div>

      {/* Modal Buat Ulang Kode QR */}
      {isRegenerateQrOpen && (
        <RegenerateQrConfirmModal
          isOpen={isRegenerateQrOpen}
          onClose={() => setIsRegenerateQrOpen(false)}
          sensorId={sensor.id}
          nodeCode={sensor.nodeCode}
        />
      )}
    </div>
  );
};

