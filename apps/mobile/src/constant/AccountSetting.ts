export type AccountProfile = {
  fullName: string;
  phone: string;
  email: string;
  /** Nama kebun / perusahaan; null untuk akun tanpa tenant (superAdmin) */
  tenantName: string | null;
};
