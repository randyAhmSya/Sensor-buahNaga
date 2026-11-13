import apiClient from "./apiClient";
import { authStorage } from "./authStorage";
import { type AccountProfile } from "@/constant/AccountSetting";

export interface UpdateAccountPayload {
  fullName: string;
  phone: string;
  email: string;
  newPassword?: string;
}

/**
 * Mengambil profil akun user yang sedang aktif.
 */
export async function fetchAccountProfile(): Promise<AccountProfile> {
  let user = authStorage.getUser();
  if (!user) {
    user = await authStorage.getUserAsync();
  }

  if (user) {
    return {
      fullName: user.nama_lengkap,
      phone: user.phone || "-",
      email: user.email,
    };
  }

  // Coba ambil langsung dari endpoint GET /api/auth/me
  try {
    const res = await apiClient.get<{
      status: string;
      data: {
        id: string;
        tenant_id?: string;
        nama_lengkap: string;
        email: string;
        role: string;
        phone?: string;
      };
    }>("/auth/me");

    const u = res.data?.data;
    if (u) {
      await authStorage.setUser({
        id: u.id,
        tenant_id: u.tenant_id,
        nama_lengkap: u.nama_lengkap,
        email: u.email,
        role: u.role,
        phone: u.phone,
        is_aktif: true,
      });

      return {
        fullName: u.nama_lengkap,
        phone: u.phone || "-",
        email: u.email,
      };
    }
  } catch (err) {
    throw new Error(
      err instanceof Error
        ? err.message
        : "Gagal memuat profil akun. Periksa koneksi internet Anda.",
    );
  }

  throw new Error("Sesi pengguna tidak ditemukan. Silakan login kembali.");
}

/**
 * Memperbarui informasi akun user.
 */
export async function updateAccountProfile(
  payload: UpdateAccountPayload,
): Promise<void> {
  const current = authStorage.getUser();
  if (!current) {
    throw new Error(
      "Sesi pengguna tidak ditemukan. Tidak dapat memperbarui profil tanpa autentikasi.",
    );
  }

  await authStorage.setUser({
    id: current.id,
    tenant_id: current.tenant_id,
    nama_lengkap: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    role: current.role,
    is_aktif: true,
  });
}
