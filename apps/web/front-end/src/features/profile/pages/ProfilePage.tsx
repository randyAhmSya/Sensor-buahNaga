import type { FC } from 'react'
import { ProfileInfoSection } from '../components/ProfileInfoSection'
import { SecuritySection } from '../components/SecuritySection'
import { TenantInfoCard } from '../components/TenantInfoCard'

export const ProfilePage: FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Profil</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola data pribadi, keamanan akun, dan informasi keanggotaan tenant.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri (8 cols): Info Akun & Keamanan */}
        <div className="lg:col-span-8 space-y-6">
          <ProfileInfoSection />
          <SecuritySection />
        </div>

        {/* Kolom Kanan (4 cols): Info Tenant */}
        <div className="lg:col-span-4">
          <TenantInfoCard />
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
