import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import type { StatusLanggananPetani } from '@/types/petaniSubscription.types';

export interface SubscriptionWarningBannerProps {
  status: StatusLanggananPetani | null;
  isLoading?: boolean;
  className?: string;
}

export const SubscriptionWarningBanner: React.FC<SubscriptionWarningBannerProps> = ({
  status,
  isLoading = false,
  className = '',
}) => {
  if (isLoading || !status) {
    return null;
  }

  const isExpired = status.status_langganan === 'kadaluarsa';
  const isGracePeriod = status.status_langganan === 'tenggang' || status.dalam_masa_tenggang;
  const isNearExpiry = typeof status.sisa_hari === 'number' && status.sisa_hari <= 3;

  // Hanya render jika memenuhi kriteria peringatan
  if (!isExpired && !isGracePeriod && !isNearExpiry) {
    return null;
  }

  const messageText = isExpired
    ? 'Masa aktif langganan Anda telah berakhir. Layanan telemetri dan otomatisasi penyinaran ditangguhkan.'
    : isGracePeriod
    ? `Akun Anda berada dalam masa tenggang (${status.sisa_hari} hari tersisa). Segera perpanjang agar sistem tetap aktif.`
    : `Langganan tersisa ${status.sisa_hari} hari. Lakukan perpanjangan untuk menjaga kelancaran operasional kebun.`;

  const bannerColorClass = isExpired
    ? 'border-rose-600 bg-rose-50 text-rose-900'
    : 'border-amber-500 bg-amber-50 text-amber-900';

  const buttonColorClass = isExpired
    ? 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-400'
    : 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-400';

  return (
    <div
      role="alert"
      className={`rounded-2xl border-2 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${bannerColorClass} ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {isExpired ? (
            <AlertTriangle className="w-5 h-5 text-rose-600" aria-hidden="true" />
          ) : (
            <Clock className="w-5 h-5 text-amber-600" aria-hidden="true" />
          )}
        </div>
        <div>
          <h2 className="text-sm md:text-base font-bold tracking-tight">
            {isExpired
              ? 'Langganan Telah Kadaluarsa'
              : `Langganan Tersisa ${status.sisa_hari} Hari`}
          </h2>
          <p className="text-xs md:text-sm mt-0.5 opacity-90 leading-relaxed font-medium">
            {messageText}
          </p>
        </div>
      </div>

      <div className="flex items-center shrink-0 self-end sm:self-center">
        <Link
          to="/petani/subscription"
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold shadow-2xs transition-all active:scale-[0.98] ${buttonColorClass}`}
        >
          <span>Perpanjang</span>
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
};
