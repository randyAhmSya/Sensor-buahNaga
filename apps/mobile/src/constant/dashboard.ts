import { Ionicons } from "@expo/vector-icons";

export type GardenStats = {
  totalGardens: number;
  activeNodes: number;
  avgHealthPercent: number;
};

export type WeatherInfo = {
  temperatureC: number;
  condition: string;
};

// `variant` dihapus -- pill aktif/enggak sekarang ditentuin dari state pilihan
// user (lihat QuickActions.tsx), bukan hardcode di data statis kayak sebelumnya.
export type QuickAction = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export type ActivityItem = {
  id: string;
  nodeId: string;
  location: string;
  lightLux: number;
  powerWh: number;
  time: string;
  thumbnailUrl: string;
};

export type HarvestEstimate = {
  id: string;
  nodeId: string; // "G1-N3"
  ripenessPercent: number; // 0-100, dipakai buat progress bar
  daysRemaining: string; // "3 Hari", "1 Minggu" -- string siap-tampil dari BE
  thumbnailUrl: string;
};

export type ActionIssueSeverity = "critical" | "warning";

export type ActionIssue = {
  id: string;
  nodeId: string; // "G1-N3-B2"
  title: string; // "Lampu Tidak Merespons (0 Watt)"
  location: string;
  icon: keyof typeof Ionicons.glyphMap;
  severity: ActionIssueSeverity;
};

export type ActionIssueGroup = {
  category: string; // "Masalah Lampu / Aktuator"
  issues: ActionIssue[];
};

export const MOCK_STATS: GardenStats = {
  totalGardens: 2,
  activeNodes: 15,
  avgHealthPercent: 99,
};

export const MOCK_WEATHER: WeatherInfo = {
  temperatureC: 30,
  condition: "Sunny Day",
};

export const QUICK_ACTIONS: QuickAction[] = [
  { key: "action-needed", label: "Perlu Tindakan", icon: "warning-outline" },
  { key: "harvest-estimate", label: "Estimasi Panen", icon: "bicycle-outline" },
  { key: "activity", label: "Aktivitas", icon: "document-text-outline" },
];

export const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    nodeId: "G1-N3-B2",
    location: "Garden North, Blok A",
    lightLux: 450,
    powerWh: 45,
    time: "12:05 PM",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=200",
  },
  {
    id: "2",
    nodeId: "G1-N2-B1",
    location: "Garden South, Blok B",
    lightLux: 420,
    powerWh: 42,
    time: "11:30 AM",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=200",
  },
  {
    id: "3",
    nodeId: "G2-N1-B5",
    location: "Garden West, Blok C",
    lightLux: 480,
    powerWh: 48,
    time: "10:15 AM",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=200",
  },
];

export const MOCK_HARVEST_ESTIMATES: HarvestEstimate[] = [
  {
    id: "1",
    nodeId: "G1-N3",
    ripenessPercent: 85,
    daysRemaining: "3 Hari",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1615671524827-c1fe3973b648?w=200",
  },
  {
    id: "2",
    nodeId: "G2-N1",
    ripenessPercent: 60,
    daysRemaining: "1 Minggu",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=200",
  },
  {
    id: "3",
    nodeId: "G1-N5",
    ripenessPercent: 40,
    daysRemaining: "2 Minggu",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=200",
  },
];

export const MOCK_ACTION_ISSUE_GROUPS: ActionIssueGroup[] = [
  {
    category: "Masalah Lampu / Aktuator",
    issues: [
      {
        id: "1",
        nodeId: "G1-N3-B2",
        title: "Lampu Tidak Merespons (0 Watt)",
        location: "Garden North, Blok A",
        icon: "bulb",
        severity: "critical",
      },
    ],
  },
  {
    category: "Perangkat Terputus",
    issues: [
      {
        id: "2",
        nodeId: "G2-N1-B1",
        title: "Offline - Terputus dari Server",
        location: "Garden West, Blok A",
        icon: "wifi-outline",
        severity: "warning",
      },
    ],
  },
  {
    category: "Sensor & Kondisi Kritis",
    issues: [
      {
        id: "3",
        nodeId: "G1-N5-B3",
        title: "Sensor Cahaya/Suhu Error",
        location: "Garden North, Blok C",
        icon: "pulse-outline",
        severity: "warning",
      },
      {
        id: "4",
        nodeId: "G1-N2-B4",
        title: "Suhu Kritis: 38°C (Auto-Dimming Aktif)",
        location: "Garden South, Blok B",
        icon: "thermometer-outline",
        severity: "warning",
      },
    ],
  },
];
