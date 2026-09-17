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
  id: '',
  fullName: '',
  email: '',
  phone: '',
  avatarUrl: '',
  role: '',
}

export const MOCK_TENANT: TenantInfo = {
  tenantId: '',
  tenantName: 'AgroLight Smart Farm',
  planName: 'Enterprise Plan',
  remainingDays: 0,
  totalDays: 30,
  isVerified: true,
}

export const MOCK_USER_PROFILE = MOCK_USER
export const MOCK_TENANT_INFO = MOCK_TENANT

export const getUserProfile = (): UserProfile => MOCK_USER
export const getTenantInfo = (): TenantInfo => MOCK_TENANT
