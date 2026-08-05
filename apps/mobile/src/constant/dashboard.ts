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

export type QuickAction = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant: "default" | "primary";
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

export const MOCK_STATS: GardenStats = {
  totalGardens: 2,
  activeNodes: 15,
  avgHealthPercent: 90,
};

export const MOCK_WEATHER: WeatherInfo = {
  temperatureC: 30,
  condition: "Sunny Day",
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    key: "action-needed",
    label: "Perlu Tindakan",
    icon: "warning-outline",
    variant: "default",
  },
  {
    key: "harvest-estimate",
    label: "Estimasi Panen",
    icon: "bicycle-outline",
    variant: "default",
  },
  {
    key: "activity",
    label: "Aktivitas",
    icon: "document-text-outline",
    variant: "primary",
  },
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
