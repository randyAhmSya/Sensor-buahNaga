import {
  MOCK_ACCOUNT_PROFILE,
  type AccountProfile,
} from "@/constant/AccountSetting";

const MOCK_DELAY_MS = 400;

export interface UpdateAccountPayload {
  fullName: string;
  phone: string;
  email: string;
  newPassword?: string;
}

// TODO BACKEND: ganti ke GET endpoint profil asli
export async function fetchAccountProfile(): Promise<AccountProfile> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  return MOCK_ACCOUNT_PROFILE;
}

// TODO BACKEND: ganti ke PATCH/PUT endpoint profil asli. Kalau newPassword
// diisi, backend juga perlu verifikasi currentPassword sebelum ganti --
// itu HARUS divalidasi di server, jangan cuma di client.
export async function updateAccountProfile(
  payload: UpdateAccountPayload,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  console.log("updateAccountProfile payload:", payload);
}
