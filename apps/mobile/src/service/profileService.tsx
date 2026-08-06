import {
  MOCK_PROFILE,
  PROFILE_MENU,
  type ProfileMenuItem,
  type UserProfile,
} from "@/constant/profile";

export interface ProfileData {
  user: UserProfile;
  menu: ProfileMenuItem[];
}

const MOCK_DELAY_MS = 500;

/**
 * TODO BACKEND: ganti isi function ini ke HTTP call asli, sama pola kayak
 * fetchDashboardData() di service/dashboardService.ts. Signature & return
 * type JANGAN diubah -- hooks/useProfile.ts dan komponen di component/profile/*
 * gak perlu disentuh selama shape ProfileData tetep sama.
 */
export async function fetchProfileData(): Promise<ProfileData> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  return {
    user: MOCK_PROFILE,
    menu: PROFILE_MENU,
  };
}
