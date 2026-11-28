import apiClient from "./apiClient";
import { authStorage } from "./authStorage";
import { queryClient } from "@/lib/queryClient";
import { QUERY_KEYS } from "@/constant/queryKeys";
import { type AccountProfile } from "@/constant/AccountSetting";

export interface UpdateAccountPayload {
  fullName: string;
  phone: string;
  tenantName: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface MeResponse {
  data: {
    id: string;
    tenant_id?: string | null;
    nama_lengkap: string;
    email: string;
    role: string;
    nomor_telepon?: string | null;
    tenant?: { nama_tenant?: string } | null;
  };
}

function toProfile(u: MeResponse["data"]): AccountProfile {
  return {
    fullName: u.nama_lengkap,
    phone: u.nomor_telepon ?? "",
    email: u.email,
    tenantName: u.tenant ? (u.tenant.nama_tenant ?? "") : null,
  };
}

async function syncLocalUser(u: MeResponse["data"]): Promise<void> {
  const current = authStorage.getUser();
  await authStorage.setUser({
    ...(current ?? { is_aktif: true }),
    id: u.id,
    tenant_id: u.tenant_id,
    nama_lengkap: u.nama_lengkap,
    email: u.email,
    role: u.role,
    phone: u.nomor_telepon ?? undefined,
    is_aktif: true,
  });
}

const PROFILE_STALE_MS = 5 * 60 * 1000;

/**
 * Profil akun dengan cache 5 menit: membuka/menutup layar berulang kali tidak
 * memanggil /auth/me lagi. Request yang sedang berjalan juga digabung.
 */
export function fetchAccountProfile(): Promise<AccountProfile> {
  return queryClient.fetchQuery({
    queryKey: QUERY_KEYS.accountSettings.all,
    queryFn: ambilProfilDariServer,
    staleTime: PROFILE_STALE_MS,
  });
}

async function ambilProfilDariServer(): Promise<AccountProfile> {
  const res = await apiClient.get<MeResponse>("/auth/me");
  const u = res.data?.data;
  if (!u)
    throw new Error("Data profil tidak ditemukan. Silakan login kembali.");
  await syncLocalUser(u);
  return toProfile(u);
}

function simpanKeCache(p: AccountProfile): AccountProfile {
  queryClient.setQueryData(QUERY_KEYS.accountSettings.all, p);
  return p;
}

/** Simpan nama, nomor HP, dan nama kebun ke backend. */
export async function updateAccountProfile(
  payload: UpdateAccountPayload,
): Promise<AccountProfile> {
  const body: Record<string, string> = {
    nama_lengkap: payload.fullName.trim(),
    nomor_telepon: payload.phone.replace(/[\s-]/g, ""),
  };
  if (payload.tenantName !== null) body.nama_tenant = payload.tenantName.trim();

  const res = await apiClient.put<MeResponse>("/auth/profil", body);
  const u = res.data?.data;
  if (u) {
    await syncLocalUser(u);
    return simpanKeCache(toProfile(u));
  }
  await queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.accountSettings.all,
  });
  return fetchAccountProfile();
}

/** Ganti kata sandi. Perangkat lain otomatis keluar, sesi ini tetap aktif. */
export async function changePassword(p: ChangePasswordPayload): Promise<void> {
  await apiClient.put("/auth/password", {
    password_lama: p.currentPassword,
    password_baru: p.newPassword,
    password_baru_confirmation: p.confirmPassword,
  });
}
