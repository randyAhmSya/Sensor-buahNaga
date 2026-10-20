/**
 * Tipe Data Spesifikasi Fitur Notifikasi AgroLight
 * Sesuai API Contract Modul 12 dan standar palet warna anti-slop
 */

export type NotificationFilterTab = 'semua' | 'belum_dibaca';

export interface RawPetaniNotification {
  id: string | number;
  judul?: string;
  title?: string;
  pesan?: string;
  message?: string;
  tipe?: 'info' | 'peringatan' | 'sistem' | 'akses_tenant_diminta' | string;
  sudah_dibaca?: boolean | number;
  dibaca?: boolean | number;
  is_read?: boolean | number;
  created_at?: string;
  waktu?: string;
  tautan?: string;
  link?: string;
}

export interface PetaniNotificationItem {
  id: string | number;
  judul: string;
  pesan: string;
  tipe: 'info' | 'peringatan' | 'sistem' | 'akses_tenant_diminta';
  sudah_dibaca: boolean;
  created_at: string;
  tautan?: string;
}

export interface AdminNotificationItem {
  id: string | number;
  judul: string;
  pesan: string;
  sudah_dibaca: boolean;
  waktu: string;
  tautan: string;
  kategori?: 'transaksi' | 'log' | 'sistem';
}
