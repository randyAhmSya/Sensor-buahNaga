export interface BackendUserDTO {
  id: string | number;
  name?: string;
  nama?: string;
  email: string;
  role?: string;
  nomor_telepon?: string;
  phone?: string;
  foto_profil?: string | null;
  avatar_url?: string | null;
}
