export type NotificationSetting = {
  key: string;
  title: string;
  description: string;
  enabled: boolean;
};

export const MOCK_NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    key: "critical-temp",
    title: "Suhu Kritis / Peringatan Panas",
    description: "Kirim alert jika suhu kebun melebihi batas aman.",
    enabled: true,
  },
  {
    key: "node-offline",
    title: "Perangkat Node Offline",
    description: "Kirim alert jika hardware ESP32 terputus dari internet.",
    enabled: true,
  },
  {
    key: "auto-dimming",
    title: "Perubahan Mode Auto-Dimming",
    description: "Notifikasi saat sistem lampu beralih ke kontrol manual.",
    enabled: false,
  },
  {
    key: "harvest-summary",
    title: "Ringkasan Estimasi Panen",
    description: "Pengingat mingguan mendekati tanggal panen.",
    enabled: true,
  },
];
