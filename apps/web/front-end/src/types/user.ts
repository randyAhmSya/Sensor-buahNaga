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
