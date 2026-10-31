import { lazy, Suspense, type FC, type ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from '../layouts/PublicLayout/PublicLayout'
import { PetaniLayout } from '../layouts/PetaniLayout/PetaniLayout'
import { DashboardLayout } from '../layouts/DashboardLayout/DashboardLayout'
import { SuperAdminLayout } from '../layouts/SuperAdminLayout/SuperAdminLayout'
import { RoleGuard } from './guards/RoleGuard'
import { USER_ROLES } from '../config/constants'
import { PageLoadingSpinner } from '../components/common/PageLoadingSpinner'
import { useSaasMode } from '@/context/SaasContext'

const SaasRouteGuard: FC<{ children: ReactNode; redirectTo: string }> = ({
  children,
  redirectTo,
}) => {
  const { isSaasEnabled } = useSaasMode()
  if (!isSaasEnabled) {
    return <Navigate to={redirectTo} replace />
  }
  return <>{children}</>
}

// Lazy-loaded Feature Pages for optimized code splitting
const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage').then((m) => ({ default: m.LandingPage })))
const FeaturesPage = lazy(() => import('@/features/landing/pages/FeaturesPage').then((m) => ({ default: m.FeaturesPage })))
const HowItWorksPage = lazy(() => import('@/features/landing/pages/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage })))
const PricingPage = lazy(() => import('@/features/landing/pages/PricingPage').then((m) => ({ default: m.PricingPage })))
const AboutUsPage = lazy(() => import('@/features/landing/pages/AboutUsPage').then((m) => ({ default: m.AboutUsPage })))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const SuperAdminDashboardPage = lazy(() => import('@/features/super-admin/pages/SuperAdminDashboardPage').then((m) => ({ default: m.SuperAdminDashboardPage })))
const SuperAdminTenantsPage = lazy(() => import('@/features/super-admin/pages/SuperAdminTenantsPage').then((m) => ({ default: m.SuperAdminTenantsPage })))
const SuperAdminUsersPage = lazy(() => import('@/features/super-admin/pages/SuperAdminUsersPage').then((m) => ({ default: m.SuperAdminUsersPage })))
const SubscriptionPackagesPage = lazy(() => import('@/features/super-admin/pages/SubscriptionPackagesPage').then((m) => ({ default: m.SubscriptionPackagesPage })))
const TenantInspectionPage = lazy(() => import('@/features/super-admin/pages/TenantInspectionPage').then((m) => ({ default: m.TenantInspectionPage })))
const AccessRequestsPage = lazy(() => import('@/features/super-admin/pages/AccessRequestsPage').then((m) => ({ default: m.AccessRequestsPage })))
const SubscriptionsPage = lazy(() => import('@/features/super-admin/pages/SubscriptionsPage').then((m) => ({ default: m.SubscriptionsPage })))
const AdminAuditLogsPage = lazy(() => import('@/features/super-admin/pages/AdminAuditLogsPage').then((m) => ({ default: m.AdminAuditLogsPage })))
const SuperAdminSettingsPage = lazy(() => import('@/features/super-admin/pages/SuperAdminSettingsPage').then((m) => ({ default: m.SuperAdminSettingsPage })))
const FarmerDashboardPage = lazy(() => import('@/features/dashboard/pages/FarmerDashboardPage').then((m) => ({ default: m.FarmerDashboardPage })))
const DeviceHealthPage = lazy(() => import('@/features/monitoring-alat/pages/DeviceHealthPage').then((m) => ({ default: m.DeviceHealthPage })))
const HarvestEstimationPage = lazy(() => import('@/features/estimasi-panen/pages/HarvestEstimationPage').then((m) => ({ default: m.HarvestEstimationPage })))
const QrGeneratorPage = lazy(() => import('@/features/manajemen-qr/pages/QrGeneratorPage').then((m) => ({ default: m.QrGeneratorPage })))
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const FarmsManagementPage = lazy(() => import('@/features/farms/pages/FarmsManagementPage').then((m) => ({ default: m.FarmsManagementPage })))
const CreateFarmPage = lazy(() => import('@/features/farms/pages/CreateFarmPage').then((m) => ({ default: m.CreateFarmPage })))
const EditFarmPage = lazy(() => import('@/features/farms/pages/EditFarmPage').then((m) => ({ default: m.EditFarmPage })))
const FarmDetailPage = lazy(() => import('@/features/farms/pages/FarmDetailPage').then((m) => ({ default: m.FarmDetailPage })))
const BlockDetailPage = lazy(() => import('@/features/blocks/pages/BlockDetailPage').then((m) => ({ default: m.BlockDetailPage })))
const CreateBlockPage = lazy(() => import('@/features/blocks/pages/CreateBlockPage').then((m) => ({ default: m.CreateBlockPage })))
const EditBlockPage = lazy(() => import('@/features/blocks/pages/EditBlockPage').then((m) => ({ default: m.EditBlockPage })))
const SensorMonitoringPage = lazy(() => import('@/features/sensors/pages/SensorMonitoringPage').then((m) => ({ default: m.SensorMonitoringPage })))
const LightingSchedulePage = lazy(() => import('@/features/schedules/pages/LightingSchedulePage').then((m) => ({ default: m.LightingSchedulePage })))
const CreateSchedulePage = lazy(() => import('@/features/schedules/pages/CreateSchedulePage').then((m) => ({ default: m.CreateSchedulePage })))
const EditSchedulePage = lazy(() => import('@/features/schedules/pages/EditSchedulePage').then((m) => ({ default: m.EditSchedulePage })))
const AdminHarvestsPage = lazy(() => import('@/features/harvests/pages/HarvestEstimationPage').then((m) => ({ default: m.HarvestEstimationPage })))
const CreateHarvestCyclePage = lazy(() => import('@/features/harvests/pages/CreateHarvestCyclePage').then((m) => ({ default: m.CreateHarvestCyclePage })))
const QRCodeManagementPage = lazy(() => import('@/features/qrcodes/pages/QRCodeManagementPage').then((m) => ({ default: m.QRCodeManagementPage })))
const FarmerAccessRequestsPage = lazy(() => import('@/features/tenant-access/pages/FarmerAccessRequestsPage').then((m) => ({ default: m.FarmerAccessRequestsPage })))
const PetaniSubscriptionPage = lazy(() => import('@/features/subscription/pages/PetaniSubscriptionPage').then((m) => ({ default: m.PetaniSubscriptionPage })))

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoadingSpinner />}>
      <Routes>
        {/* Rute Publik */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rute Super Admin (Portal Sistem Terpusat) */}
        <Route
          path="/admin"
          element={
            <RoleGuard allowedRoles={[USER_ROLES.SUPER_ADMIN]}>
              <SuperAdminLayout />
            </RoleGuard>
          }
        >
          <Route index element={<SuperAdminDashboardPage />} />
          <Route path="dashboard" element={<SuperAdminDashboardPage />} />
          <Route path="tenant" element={<SuperAdminTenantsPage />} />
          <Route path="tenant/:tenantId/inspeksi" element={<TenantInspectionPage />} />
          <Route path="tenants" element={<Navigate to="/admin/tenant" replace />} />
          <Route path="users" element={<SuperAdminUsersPage />} />
          <Route
            path="paket"
            element={
              <SaasRouteGuard redirectTo="/admin/dashboard">
                <SubscriptionPackagesPage />
              </SaasRouteGuard>
            }
          />
          <Route
            path="langganan"
            element={
              <SaasRouteGuard redirectTo="/admin/dashboard">
                <SubscriptionsPage />
              </SaasRouteGuard>
            }
          />
          <Route path="subscriptions" element={<Navigate to="/admin/langganan" replace />} />
          <Route path="log-aktivitas" element={<AdminAuditLogsPage />} />
          <Route path="access-requests" element={<AccessRequestsPage />} />
          <Route path="settings" element={<SuperAdminSettingsPage />} />
          <Route path="profile" element={<SuperAdminSettingsPage />} />
        </Route>

        {/* Alias Backward Compatibility Super Admin */}
        <Route path="/super-admin" element={<Navigate to="/admin" replace />} />
        <Route path="/super-admin/*" element={<Navigate to="/admin" replace />} />

        {/* Rute Farmer Admin (Portal Pengelola Kebun) */}
        <Route
          path="/kebun"
          element={
            <RoleGuard allowedRoles={[USER_ROLES.ADMIN_KEBUN]}>
              <DashboardLayout />
            </RoleGuard>
          }
        >
          <Route index element={<Navigate to="/kebun/farms" replace />} />
          <Route path="dashboard" element={<FarmerDashboardPage />} />
          <Route path="farms" element={<FarmsManagementPage />} />
          <Route path="farms/new" element={<CreateFarmPage />} />
          <Route path="farms/:farmId/edit" element={<EditFarmPage />} />
          <Route path="farms/:id/edit" element={<EditFarmPage />} />
          <Route path="farms/:farmId/blocks/new" element={<CreateBlockPage />} />
          <Route path="farms/:farmId/blocks/:blockId/edit" element={<EditBlockPage />} />
          <Route path="farms/:farmId/blocks/:blockId" element={<BlockDetailPage />} />
          <Route path="farms/:farmId/blocks/:id" element={<BlockDetailPage />} />
          <Route path="blocks/:blockId" element={<BlockDetailPage />} />
          <Route path="blocks/:id" element={<BlockDetailPage />} />
          <Route path="farms/:farmId" element={<FarmDetailPage />} />
          <Route path="farms/:id" element={<FarmDetailPage />} />
          <Route path="sensors" element={<SensorMonitoringPage />} />
          <Route path="sensors/:sensorId" element={<SensorMonitoringPage />} />
          <Route path="schedules" element={<LightingSchedulePage />} />
          <Route path="schedules/new" element={<CreateSchedulePage />} />
          <Route path="schedules/:scheduleId/edit" element={<EditSchedulePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="monitoring" element={<DeviceHealthPage />} />
          <Route path="estimasi" element={<HarvestEstimationPage />} />
          <Route path="harvests" element={<AdminHarvestsPage />} />
          <Route path="harvests/new" element={<CreateHarvestCyclePage />} />
          <Route path="qrcodes" element={<QRCodeManagementPage />} />
          <Route path="qr" element={<QrGeneratorPage />} />
          <Route
            path="langganan"
            element={
              <SaasRouteGuard redirectTo="/kebun/dashboard">
                <PetaniSubscriptionPage />
              </SaasRouteGuard>
            }
          />
          <Route path="akses-tenant" element={<FarmerAccessRequestsPage />} />
        </Route>

        {/* Alias Backward Compatibility URL Operasional Petani dari /admin/* */}
        <Route path="/admin/farms" element={<Navigate to="/kebun/farms" replace />} />
        <Route path="/admin/farms/*" element={<Navigate to="/kebun/farms" replace />} />
        <Route path="/admin/sensors" element={<Navigate to="/kebun/sensors" replace />} />
        <Route path="/admin/sensors/*" element={<Navigate to="/kebun/sensors" replace />} />
        <Route path="/admin/schedules" element={<Navigate to="/kebun/schedules" replace />} />
        <Route path="/admin/schedules/*" element={<Navigate to="/kebun/schedules" replace />} />
        <Route path="/admin/harvests" element={<Navigate to="/kebun/harvests" replace />} />
        <Route path="/admin/harvests/*" element={<Navigate to="/kebun/harvests" replace />} />
        <Route path="/admin/qrcodes" element={<Navigate to="/kebun/qrcodes" replace />} />
        <Route path="/admin/qrcodes/*" element={<Navigate to="/kebun/qrcodes" replace />} />

        {/* Redirects Operasional Kebun & Root Fallbacks */}
        <Route path="/dashboard" element={<Navigate to="/kebun/dashboard" replace />} />
        <Route path="/farms" element={<Navigate to="/kebun/farms" replace />} />
        <Route path="/sensors" element={<Navigate to="/kebun/sensors" replace />} />
        <Route path="/schedules" element={<Navigate to="/kebun/schedules" replace />} />
        <Route path="/harvests" element={<Navigate to="/kebun/harvests" replace />} />
        <Route path="/qrcodes" element={<Navigate to="/kebun/qrcodes" replace />} />
        <Route path="/langganan" element={<Navigate to="/kebun/langganan" replace />} />
        <Route path="/profile" element={<Navigate to="/kebun/profile" replace />} />

        {/* Rute Petani (Simplified Operasional Lapangan) */}
        <Route
          path="/petani"
          element={
            <RoleGuard
              allowedRoles={[USER_ROLES.ADMIN_KEBUN, USER_ROLES.PETANI]}
            >
              <PetaniLayout />
            </RoleGuard>
          }
        >
          <Route index element={<Navigate to="/petani/estimasi" replace />} />
          <Route path="estimasi" element={<HarvestEstimationPage />} />
          <Route path="qr" element={<QrGeneratorPage />} />
          <Route path="akses-tenant" element={<FarmerAccessRequestsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
