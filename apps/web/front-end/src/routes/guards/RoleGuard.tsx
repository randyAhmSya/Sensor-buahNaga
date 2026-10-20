import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import type { UserRole } from '../../config/constants'


interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: ReactNode
  redirectTo?: string
}

export function RoleGuard({
  allowedRoles,
  children,
  redirectTo = '/login',
}: RoleGuardProps) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />
  }

  const userRole = (user.role || '').toLowerCase()
  const isAllowed = allowedRoles.some((role) => {
    const r = role.toLowerCase()
    if (r === userRole) return true
    if ((r === 'super_admin' || r === 'superadmin') && (userRole === 'super_admin' || userRole === 'superadmin')) {
      return true
    }
    return false
  })

  if (!isAllowed) {
    // Alihkan cerdas sesuai role pengguna agar tidak terlempar ke halaman yang salah
    if (userRole === 'super_admin' || userRole === 'superadmin') {
      return <Navigate to="/admin" replace />
    }
    if (userRole === 'petani' || userRole === 'petani_biasa') {
      return <Navigate to="/petani/estimasi" replace />
    }
    return <Navigate to="/kebun/farms" replace />
  }

  return <>{children}</>
}
