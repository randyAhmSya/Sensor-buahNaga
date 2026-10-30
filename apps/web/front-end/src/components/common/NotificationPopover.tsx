import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { adminService } from '@/services/adminService';
import { notificationKeys, queryKeys, tenantKeys } from '@/services/queryKeys';
import { useAdminAccessHistoryQuery } from '@/hooks/useAdmin';
import { Bell } from 'lucide-react';
import type { NotificationFilterTab } from '@/types/notification.types';

export interface NotificationPopoverProps {
  role: 'super_admin' | 'petani' | 'admin_kebun';
  className?: string;
  triggerButtonClassName?: string;
}

interface DisplayNotificationItem {
  id: string | number;
  judul: string;
  pesan: string;
  sudah_dibaca: boolean;
  waktuRelatif: string;
  tautan?: string;
  tipe?: string;
}

/**
 * Helper format waktu relatif tanpa em dash
 */
function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Baru saja';
  try {
    const then = new Date(dateString).getTime();
    const now = Date.now();
    const diffSec = Math.floor((now - then) / 1000);

    if (diffSec < 60) return 'Baru saja';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} jam yang lalu`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay} hari yang lalu`;
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return 'Beberapa waktu lalu';
  }
}

const STORAGE_ADMIN_READ_KEY = 'agrolight_admin_read_notifications';

function getAdminReadIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_READ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAdminReadIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_ADMIN_READ_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage quota errors
  }
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  role,
  className = '',
  triggerButtonClassName = '',
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<NotificationFilterTab>('semua');
  const [adminReadIds, setAdminReadIds] = useState<string[]>(getAdminReadIds);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const isSuperAdmin = role === 'super_admin';

  // ==========================================
  // Mode Super Admin: Data Dashboard Ringkasan & Akses
  // ==========================================
  const adminSummaryQuery = useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: () => adminService.getDashboardSummary(),
    enabled: isSuperAdmin,
    staleTime: 1000 * 60,
  });

  const { data: adminAccessHistory = [] } = useAdminAccessHistoryQuery({ enabled: isSuperAdmin });

  const adminNotifications: DisplayNotificationItem[] = useMemo(() => {
    if (!isSuperAdmin) return [];
    const items: DisplayNotificationItem[] = [];

    // 1. Notifikasi riwayat keputusan akses tenant (diputuskan_pada !== null)
    adminAccessHistory
      .filter((h) => h.diputuskan_pada !== null)
      .slice(0, 5)
      .forEach((h) => {
        const id = `access_decided_${h.id}`;
        const tenantName = h.tenant?.nama_tenant || `Tenant #${h.tenant_id}`;
        const statusLabel =
          h.status === 'disetujui' ? 'Disetujui' : h.status === 'ditolak' ? 'Ditolak' : 'Dicabut';

        items.push({
          id,
          judul: `Izin Akses ${statusLabel}`,
          pesan: `Permintaan inspeksi untuk ${tenantName} telah ${statusLabel.toLowerCase()}${
            h.alasan_penolakan ? `: "${h.alasan_penolakan}"` : '.'
          }`,
          sudah_dibaca: adminReadIds.includes(id),
          waktuRelatif: formatRelativeTime(h.diputuskan_pada || h.diminta_pada),
          tautan:
            h.status === 'disetujui'
              ? `/admin/tenant/${h.tenant_id}/inspeksi`
              : '/admin/akses-tenant',
        });
      });

    // 2. Notifikasi transaksi menunggu tindakan
    if (adminSummaryQuery.data) {
      const summary = adminSummaryQuery.data;
      const pendingVerif = summary.transaksi?.menunggu_pembayaran ?? summary.transaksi_keuangan?.menunggu_pembayaran ?? 0;
      if (pendingVerif > 0) {
        const id = `tx_pending_${pendingVerif}`;
        items.push({
          id,
          judul: 'Transaksi Perlu Tindakan',
          pesan: `${pendingVerif} transaksi langganan menunggu verifikasi mutasi pembayaran.`,
          sudah_dibaca: adminReadIds.includes(id),
          waktuRelatif: 'Operasional Hari Ini',
          tautan: '/admin/langganan',
        });
      }

      // 3. Notifikasi log aktivitas terbaru
      const recentLogs = summary.aktivitas_terbaru || [];
      recentLogs.slice(0, 5).forEach((log) => {
        const id = `log_${log.id}`;
        items.push({
          id,
          judul: log.aksi ? `Aktivitas: ${log.aksi}` : 'Log Aktivitas Baru',
          pesan: `${log.nama_admin} pada ${log.target_tipe}: ${log.keterangan}`,
          sudah_dibaca: adminReadIds.includes(id),
          waktuRelatif: formatRelativeTime(log.waktu),
          tautan: '/admin/log-aktivitas',
        });
      });
    }

    return items;
  }, [isSuperAdmin, adminAccessHistory, adminSummaryQuery.data, adminReadIds]);

  // ==========================================
  // Mode Petani / Admin Kebun: Service API
  // ==========================================
  const notificationFilter = useMemo(() => {
    return filterTab === 'belum_dibaca' ? { belum_dibaca: true } : {};
  }, [filterTab]);

  const petaniNotificationsQuery = useQuery({
    queryKey: notificationKeys.list(notificationFilter),
    queryFn: () => notificationService.getPetaniNotifications(notificationFilter),
    enabled: !isSuperAdmin,
    staleTime: 1000 * 30,
  });

  const markPetaniSingleMutation = useMutation({
    mutationFn: (id: string | number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  const markPetaniAllMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  // Gabungkan daftar notifikasi aktif
  const activeNotifications: DisplayNotificationItem[] = useMemo(() => {
    if (isSuperAdmin) {
      if (filterTab === 'belum_dibaca') {
        return adminNotifications.filter((item) => !item.sudah_dibaca);
      }
      return adminNotifications;
    }

    const raw = petaniNotificationsQuery.data || [];
    return raw.map((item) => ({
      id: item.id,
      judul: item.judul,
      pesan: item.pesan,
      sudah_dibaca: item.sudah_dibaca,
      waktuRelatif: formatRelativeTime(item.created_at),
      tautan: item.tautan || (item.tipe === 'akses_tenant_diminta' ? '/petani/akses-tenant' : undefined),
      tipe: item.tipe,
    }));
  }, [isSuperAdmin, filterTab, adminNotifications, petaniNotificationsQuery.data]);

  const unreadCount = useMemo(() => {
    if (isSuperAdmin) {
      return adminNotifications.filter((i) => !i.sudah_dibaca).length;
    }
    const raw = petaniNotificationsQuery.data || [];
    return raw.filter((i) => !i.sudah_dibaca).length;
  }, [isSuperAdmin, adminNotifications, petaniNotificationsQuery.data]);

  const handleMarkAllRead = () => {
    if (isSuperAdmin) {
      const allIds = adminNotifications.map((i) => String(i.id));
      const updated = Array.from(new Set([...adminReadIds, ...allIds]));
      setAdminReadIds(updated);
      saveAdminReadIds(updated);
    } else {
      markPetaniAllMutation.mutate();
    }
  };

  const handleItemClick = (item: DisplayNotificationItem) => {
    if (isSuperAdmin) {
      const updated = Array.from(new Set([...adminReadIds, String(item.id)]));
      setAdminReadIds(updated);
      saveAdminReadIds(updated);
      if (item.tautan) {
        setIsOpen(false);
        navigate(item.tautan);
      }
    } else {
      if (!item.sudah_dibaca) {
        markPetaniSingleMutation.mutate(item.id);
      }
      if (item.tipe === 'akses_tenant_diminta' || item.tautan?.includes('akses-tenant')) {
        queryClient.invalidateQueries({ queryKey: tenantKeys.aksesRequests() });
      }
      if (item.tautan) {
        setIsOpen(false);
        navigate(item.tautan);
      }
    }
  };

  const isLoading = isSuperAdmin
    ? adminSummaryQuery.isPending
    : petaniNotificationsQuery.isPending;

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Tombol Lonceng Topbar */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={
          triggerButtonClassName ||
          'p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full relative transition-colors cursor-pointer active:scale-95'
        }
        aria-label="Buka daftar notifikasi"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4 text-slate-500 shrink-0" strokeWidth={1.75} />

        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
        )}
      </button>

      {/* Popover / Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-lg py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Panel */}
          <div className="px-4 pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Notifikasi</span>
              {unreadCount > 0 ? (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {unreadCount} baru
                </span>
              ) : null}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium cursor-pointer"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* Compact Filter Tabs */}
          <div className="px-4 pt-2.5 pb-2 flex items-center gap-1.5 border-b border-slate-100/80">
            <button
              type="button"
              onClick={() => setFilterTab('semua')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterTab === 'semua'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('belum_dibaca')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterTab === 'belum_dibaca'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Belum Dibaca {unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          </div>

          {/* Konten Daftar Notifikasi */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-4 space-y-3">
                <div className="space-y-1.5 animate-pulse">
                  <div className="h-3.5 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                </div>
                <div className="space-y-1.5 animate-pulse pt-2">
                  <div className="h-3.5 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-4/5" />
                </div>
              </div>
            ) : activeNotifications.length === 0 ? (
              /* Minimalist Empty State */
              <div className="py-10 px-4 text-center">
                <p className="text-xs text-slate-500 font-medium">Belum ada notifikasi baru</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Semua aktivitas dan informasi terbaru akan muncul di sini.
                </p>
              </div>
            ) : (
              activeNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 px-4 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                    !item.sudah_dibaca ? 'bg-slate-50/50' : 'bg-white'
                  }`}
                >
                  {/* Dot status belum dibaca */}
                  <div className="pt-1.5 shrink-0">
                    {!item.sudah_dibaca ? (
                      <span className="block w-2 h-2 rounded-full bg-emerald-600" />
                    ) : (
                      <span className="block w-2 h-2 rounded-full bg-transparent" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${
                        !item.sudah_dibaca
                          ? 'font-medium text-slate-900'
                          : 'font-normal text-slate-600'
                      }`}
                    >
                      {item.judul}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.pesan}
                    </p>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      {item.waktuRelatif}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
