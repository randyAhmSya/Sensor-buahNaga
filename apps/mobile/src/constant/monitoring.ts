export type NodeStatus = "normal" | "problem";

export type MonitoringNode = {
  id: string; // "G1-N3-B2"
  location: string; // "Garden North"
  time: string; // "10:30 WIB"
  temperatureC: number;
  lightLux?: number; // node bermasalah kadang gak ada data lux, makanya opsional
  status: NodeStatus;
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
  { key: "today", label: "Hari Ini" },
  { key: "by-date", label: "Berdasarkan Tanggal" },
];

export const MOCK_MONITORING_GROUPS: MonitoringGroup[] = [
  {
    dateLabel: "Hari Ini, 28 Juli 2026",
    nodes: [
      {
        id: "G1-N3-B2",
        location: "Garden North",
        time: "10:30 WIB",
        temperatureC: 28,
        lightLux: 450,
        status: "normal",
      },
      {
        id: "G2-N1-B5",
        location: "Garden South",
        time: "08:15 WIB",
        temperatureC: 36,
        status: "problem",
      },
    ],
  },
  {
    dateLabel: "Kemarin, 27 Juli 2026",
    nodes: [
      {
        id: "G1-N2-B1",
        location: "Garden North",
        time: "16:45 WIB",
        temperatureC: 29,
        lightLux: 420,
        status: "normal",
      },
    ],
  },
];
