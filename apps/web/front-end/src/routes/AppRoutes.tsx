import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PublicLayout } from '../layouts/PublicLayout/PublicLayout'
import { PetaniLayout } from '../layouts/PetaniLayout/PetaniLayout'
import { DashboardLayout } from '../layouts/DashboardLayout/DashboardLayout'
import { RoleGuard } from './guards/RoleGuard'
import { USER_ROLES } from '../config/constants'
import { PageLoadingSpinner } from '../components/common/PageLoadingSpinner'

// Lazy-loaded Feature Pages for optimized code splitting
const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage').then((m) => ({ default: m.LandingPage })))
const FeaturesPage = lazy(() => import('@/features/landing/pages/FeaturesPage').then((m) => ({ default: m.FeaturesPage })))
const HowItWorksPage = lazy(() => import('@/features/landing/pages/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage })))
const PricingPage = lazy(() => import('@/features/landing/pages/PricingPage').then((m) => ({ default: m.PricingPage })))
const AboutUsPage = lazy(() => import('@/features/landing/pages/AboutUsPage').then((m) => ({ default: m.AboutUsPage })))
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })))
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

        {/* Rute Farmer Admin (Portal Pengelola Kebun) */}
        <Route
          path="/admin"
          element={
            <RoleGuard allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN_KEBUN]}>
              <DashboardLayout />
            </RoleGuard>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<FarmerDashboardPage />} />
          <Route path="farms" element={<FarmsManagementPage />} />
          <Route path="farms/new" element={<CreateFarmPage />} />
          <Route path="farms/:farmId/edit" element={<EditFarmPage />} />
          <Route path="farms/:id/edit" element={<EditFarmPage />} />
          <Route path="farms/:farmId/blocks/new" element={<CreateBlockPage />} />
          <Route path="farms/:farmId/blocks/:blockId/edit" element={<EditBlockPage />} />
          <Route path="farms/:farmId/blocks/:blockId" element={<BlockDetailPage />} />
          <Route path="farms/:id" element={<FarmDetailPage />} />
          <Route path="sensors" element={<SensorMonitoringPage />} />
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
        </Route>

        {/* Redirects */}
        <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/farms" element={<Navigate to="/admin/farms" replace />} />
        <Route path="/sensors" element={<Navigate to="/admin/sensors" replace />} />
        <Route path="/schedules" element={<Navigate to="/admin/schedules" replace />} />
        <Route path="/harvests" element={<Navigate to="/admin/harvests" replace />} />
        <Route path="/qrcodes" element={<Navigate to="/admin/qrcodes" replace />} />
        <Route path="/profile" element={<Navigate to="/admin/profile" replace />} />

        {/* Rute Petani (Simplified Operasional Lapangan) */}
        <Route
          path="/petani"
          element={
            <RoleGuard
              allowedRoles={[USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN_KEBUN, USER_ROLES.PETANI]}
            >
              <PetaniLayout />
            </RoleGuard>
          }
        >
          <Route index element={<Navigate to="/petani/estimasi" replace />} />
          <Route path="estimasi" element={<HarvestEstimationPage />} />
          <Route path="qr" element={<QrGeneratorPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
