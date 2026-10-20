import { useState, type FC } from 'react'
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Toast, type ToastType } from '@/components/feedback/Toast'
import { useAdminPackages, useTogglePackageStatus } from '@/hooks/useAdmin'
import type { PaketLanggananItem } from '@/types/admin.types'
import { PackageFormModal } from '../components/PackageFormModal'
import { PackageDeleteModal } from '../components/PackageDeleteModal'

export const SubscriptionPackagesPage: FC = () => {
  const { data: packages = [], isLoading, isError, error, refetch } = useAdminPackages()
  const toggleStatusMutation = useTogglePackageStatus()

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<PaketLanggananItem | null>(null)
  const [deletePackageItem, setDeletePackageItem] = useState<PaketLanggananItem | null>(null)

  // Toast state
  const [toastState, setToastState] = useState<{
    isVisible: boolean
    type: ToastType
    title: string
    message: string
  }>({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
  })

  const showToast = (title: string, message: string, type: ToastType = 'success') => {
    setToastState({
      isVisible: true,
      type,
      title,
      message,
    })
  }

  const formatRupiah = (val: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const handleToggleStatus = async (pkg: PaketLanggananItem) => {
    const targetStatus = !pkg.status_aktif
    try {
      await toggleStatusMutation.mutateAsync({
        id: pkg.id_paket,
        statusAktif: targetStatus,
      })
      const txt = targetStatus ? 'diaktifkan' : 'dinonaktifkan'
      showToast('Berhasil', `Paket ${pkg.nama_paket} berhasil ${txt}.`, 'success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui status paket.'
      showToast('Gagal', msg, 'error')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastState.isVisible && (
        <div className="fixed top-5 right-5 z-50">
          <Toast
            type={toastState.type}
            title={toastState.title}
            message={toastState.message}
            isVisible={toastState.isVisible}
            onClose={() => setToastState((prev) => ({ ...prev, isVisible: false }))}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/admin/langganan"
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Kembali ke Transaksi Langganan</span>
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Katalog Paket Langganan
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
              {packages.length} Paket
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi tarif harga, penambahan durasi hari aktif, dan kontrol ketersediaan paket untuk tenant mitra.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => {
            setSelectedPackage(null)
            setIsFormOpen(true)
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
        >
          <Plus className="w-4 h-4 shrink-0" strokeWidth={1.75} />
          <span>Tambah Paket Baru</span>
        </Button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-slate-900">Gagal Memuat Katalog Paket</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {error?.message || 'Terjadi gangguan saat mengambil data paket langganan dari backend.'}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs"
            >
              Coba Lagi
            </Button>
          </div>
        ) : packages.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-8 h-8 text-slate-400 mx-auto" strokeWidth={1.75} />
            <h3 className="text-sm font-semibold text-slate-900">Belum Ada Paket Langganan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Katalog paket langganan sistem masih kosong. Klik tombol di atas untuk menambahkan paket pertama.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Nama Paket</th>
                  <th className="py-3 px-4">Tambahan Hari</th>
                  <th className="py-3 px-4">Tarif Harga (IDR)</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4">Status Publikasi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packages.map((pkg) => {
                  const isActive = Boolean(pkg.status_aktif)
                  return (
                    <tr key={pkg.id_paket} className="hover:bg-slate-50/60 transition-colors">
                      {/* Nama Paket */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4" strokeWidth={1.75} />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {pkg.nama_paket}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {String(pkg.id_paket)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tambahan Hari */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
                          +{pkg.tambahan_hari} Hari
                        </span>
                      </td>

                      {/* Harga */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 text-xs">
                          {formatRupiah(pkg.harga)}
                        </span>
                      </td>

                      {/* Keterangan */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 text-[11px]">
                        {pkg.keterangan || 'Paket langganan standar kebun buah naga.'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {isActive ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Toggle Status */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(pkg)}
                            disabled={toggleStatusMutation.isPending}
                            className={`p-1.5 h-auto text-xs ${
                              isActive
                                ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title={isActive ? 'Sembunyikan dari katalog' : 'Tampilkan di katalog'}
                          >
                            {isActive ? (
                              <ToggleRight className="w-3.5 h-3.5 text-slate-600" strokeWidth={1.75} />
                            ) : (
                              <ToggleLeft className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.75} />
                            )}
                          </Button>

                          {/* Edit */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPackage(pkg)
                              setIsFormOpen(true)
                            }}
                            className="p-1.5 h-auto text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
                            title="Edit Paket"
                          >
                            <Pencil className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </Button>

                          {/* Delete */}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletePackageItem(pkg)}
                            className="p-1.5 h-auto text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
                            title="Hapus Paket"
                          >
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <PackageFormModal
        isOpen={isFormOpen}
        packageItem={selectedPackage}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedPackage(null)
        }}
        onSuccess={(msg) => showToast('Berhasil', msg, 'success')}
      />

      <PackageDeleteModal
        isOpen={Boolean(deletePackageItem)}
        packageItem={deletePackageItem}
        onClose={() => setDeletePackageItem(null)}
        onSuccess={(msg) => showToast('Berhasil', msg, 'success')}
      />
    </div>
  )
}
