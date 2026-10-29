export type NodeStatus = "normal" | "problem";

export type MonitoringNode = {
  id: string; // id_sensor (UUID) atau identifier rute
  code: string; // kode_perangkat (misal: "NODE-01" atau "QR-NODE-2BLOEF")
  name?: string;
  location: string; // "Kebun Banyuwangi - Blok A"
  time: string; // "10:30 WIB"
  temperatureC?: number;
  lightLux?: number;
  status: NodeStatus;
  statusKoneksi: string; // "online" | "offline" | "terhubung" | "terputus"
};

export type MonitoringGroup = {
  dateLabel: string; // "Hari Ini, 28 Juli 2026"
  nodes: MonitoringNode[];
};

export type FilterOption = {
  key: string;
  label: string;
};

export const FILTER_OPTIONS: FilterOption[] = [
  { key: "all", label: "Semua" },
  { key: "active", label: "Aktif" },
  { key: "inactive", label: "Inactive" },
];

