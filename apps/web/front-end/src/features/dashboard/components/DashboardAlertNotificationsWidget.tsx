import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertCircle, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

export interface DashboardAlertItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'danger' | 'warning' | 'info';
  source: 'device' | 'subscription' | 'system';
  link?: string;
}

export interface DashboardAlertNotificationsWidgetProps {
  alerts: DashboardAlertItem[];
  isLoading?: boolean;
  onViewAll?: () => void;
  className?: string;
}

export const DashboardAlertNotificationsWidget: React.FC<DashboardAlertNotificationsWidgetProps> = ({
  alerts = [],
  isLoading = false,
  onViewAll,
  className = '',
}) => {
  const displayAlerts = alerts.slice(0, 5);

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 md:p-6 flex flex-col justify-between h-full ${className}`}
    >
      {/* Header dengan Tombol Lihat Semua */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Bell className="w-4 h-4 text-slate-400 shrink-0" strokeWidth={1.75} />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Peringatan & Notifikasi</h2>
            <p className="text-xs text-slate-500">Pemberitahuan terkini status perangkat dan akun</p>
          </div>
        </div>

        {onViewAll ? (
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <span>Lihat semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <Link
            to="/petani/notifikasi"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 active:scale-[0.98] transition-transform"
          >
            <span>Lihat semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Konten Notifikasi */}
      <div className="flex-1 flex flex-col justify-around py-1 divide-y divide-slate-100">
        {isLoading ? (
          <div className="py-6 space-y-3 animate-pulse">
            <div className="h-4 bg-slate-100 rounded-md w-3/4" />
            <div className="h-4 bg-slate-100 rounded-md w-1/2" />
          </div>
        ) : displayAlerts.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">Semua Sistem Normal</p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Tidak ada peringatan kritis atau notifikasi baru yang memerlukan tindakan.
            </p>
          </div>
        ) : (
          displayAlerts.map((item) => {
            const isDanger = item.type === 'danger';
            const isWarning = item.type === 'warning';

            return (
              <div key={item.id} className="py-3 flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {isDanger ? (
                    <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  ) : isWarning ? (
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                      <Bell className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
