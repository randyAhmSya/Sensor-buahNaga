export interface UserProfile {
  id: string
  fullName: string
  email: string
  phone: string
  avatarUrl: string
  role: string
}

export interface TenantInfo {
  tenantId: string
  tenantName: string
  planName: string
  remainingDays: number
  totalDays: number
  isVerified: boolean
}

// Backward compatibility type aliases
export type UserProfileData = UserProfile
export interface TenantSubscriptionData extends TenantInfo {
  tier?: string
  activePercentage?: number
}

export const MOCK_USER: UserProfile = {
  id: 'usr-001',
  fullName: 'Budi Santoso',
  email: 'budi.santoso@cempakagarden.com',
  phone: '+62 812 3456 7890',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCIHpTAaMsQ-T1p3mAAVTHR_BMdWpTIZ4ur_Wh6kHx5BLHw2rp-s8dv0fVj5hm5veikdYULA09iIrYSmFiAxwO08yEph43TiJzodQd-VMKAXMziddvcDqZCVA4tzfgF5RBWVTM2qmkpYeld4v7xjWOUv_0GbgVBV5SYNfV0LDlpJBuSNCZKJi4zSfrgvrBJ_ywXJNftMPCoZ0gd2DTCh-NXMd4dqan2sV2o_tfyEQWEK0LN2ixv_z3PDw',
  role: 'Farmer Admin',
}

export const MOCK_TENANT: TenantInfo = {
  tenantId: 'tnt-001',
  tenantName: 'Cempaka Garden',
  planName: 'Enterprise Plan',
  remainingDays: 45,
  totalDays: 60,
  isVerified: true,
}

export const MOCK_USER_PROFILE = MOCK_USER
export const MOCK_TENANT_INFO = MOCK_TENANT

export const getUserProfile = (): UserProfile => MOCK_USER
export const getTenantInfo = (): TenantInfo => MOCK_TENANT
