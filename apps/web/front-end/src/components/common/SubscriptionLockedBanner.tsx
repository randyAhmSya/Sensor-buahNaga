import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';

interface SubscriptionLockedBannerProps {
  pesan?: string;
  className?: string;
}

export const SubscriptionLockedBanner: FC<SubscriptionLockedBannerProps> = ({
  pesan = 'Masa aktif langganan tenant Anda telah berakhir. Akses ke modul operasional dinonaktifkan sementara sampai paket diperpanjang.',
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-emerald-400">
          <ShieldAlert className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight">
            Langganan Perlu Diperpanjang (HTTP 402)
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed max-w-2xl">
            {pesan}
          </p>
        </div>
      </div>

      <Link
        to="/kebun/langganan"
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all duration-150 active:scale-[0.98] shrink-0"
      >
        <span>Buka Menu Langganan</span>
        <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
      </Link>
    </div>
  );
};
