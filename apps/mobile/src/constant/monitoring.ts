export type NodeStatus = "normal" | "problem";

export type MonitoringNode = {
  id: string; // id_sensor (UUID) atau identifier rute
  code: string; // kode_perangkat (misal: "NODE-01" atau "QR-NODE-2BLOEF")
  name?: string;
  location: string; // "Kebun Banyuwangi - Blok A"
  time: string; // "05.47 WIB"
  temperatureC?: number | null;
  lightLux?: number | null;
  isBasi?: boolean;
  waktuRelatif?: string | null;
  dicatatPada?: string | null;
  status: NodeStatus;
  statusKoneksi: string; // "online" | "offline" | "belum_pernah_terlihat"
};

export type MonitoringGroup = {
  dateLabel: string; // "Hari Ini, 4 November 2026"
  nodes: MonitoringNode[];
};

export type FilterOption = {
  key: string;
  label: string;
};

export const FILTER_OPTIONS: FilterOption[] = [
  { key: "all", label: "Semua" },
  { key: "active", label: "Aktif" },
  { key: "inactive", label: "Nonaktif" },
];
