import { type FC } from 'react'
import { AlertCircle, X, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useToggleUserStatus } from '@/hooks/useAdmin'
import type { AdminUserItem } from '@/types/admin.types'

interface UserToggleStatusModalProps {
  isOpen: boolean
  user: AdminUserItem | null
  onClose: () => void
  onSuccess: (message: string) => void
}

export const UserToggleStatusModal: FC<UserToggleStatusModalProps> = ({
  isOpen,
  user,
  onClose,
  onSuccess,
}) => {
  const toggleMutation = useToggleUserStatus()

  if (!isOpen || !user) return null

  const isCurrentlyActive = user.is_aktif
  const targetState = !isCurrentlyActive

  const handleConfirm = async () => {
    try {
      await toggleMutation.mutateAsync({
        id: user.id,
        activate: targetState,
      })
      const actionText = targetState ? 'diaktifkan' : 'dinonaktifkan'
      onSuccess(`Status akun pengguna ${user.nama_lengkap} berhasil ${actionText}.`)
      onClose()
    } catch (err: unknown) {
      console.error(err)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="toggle-user-title"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isCurrentlyActive ? 'bg-slate-100 text-slate-700' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {isCurrentlyActive ? (
                <ShieldAlert className="w-4 h-4" strokeWidth={1.75} />
              ) : (
                <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
              )}
            </div>
            <div>
              <h2 id="toggle-user-title" className="text-base font-bold text-slate-900">
                {isCurrentlyActive ? 'Nonaktifkan Akun Pengguna' : 'Aktifkan Akun Pengguna'}
              </h2>
              <p className="text-xs text-slate-500">
                Konfirmasi perubahan status akses operasional akun.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin {isCurrentlyActive ? 'menonaktifkan' : 'mengaktifkan'} akun{' '}
            <strong className="text-slate-900">{user.nama_lengkap}</strong> ({user.email})?
          </p>

          {isCurrentlyActive && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" strokeWidth={1.75} />
              <div className="text-[11px] text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-900 block mb-0.5">
                  Pencabutan Token Sesi Aktif
                </span>
                Menonaktifkan pengguna akan langsung mencabut seluruh token otentikasi Sanctum aktif (tokens delete). Pengguna akan otomatis dikeluarkan dari semua sesi perangkat yang sedang login.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={toggleMutation.isPending}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant={isCurrentlyActive ? 'outline' : 'primary'}
              size="sm"
              onClick={handleConfirm}
              disabled={toggleMutation.isPending}
              className={`text-xs ${
                isCurrentlyActive
                  ? 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
              }`}
            >
              {toggleMutation.isPending
                ? 'Memproses...'
                : isCurrentlyActive
                ? 'Ya, Nonaktifkan'
                : 'Ya, Aktifkan Akun'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
