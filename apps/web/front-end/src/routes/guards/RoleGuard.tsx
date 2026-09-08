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

  if (!allowedRoles.includes(user.role)) {
    // If not authorized for this specific role, redirect to appropriate default page
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
