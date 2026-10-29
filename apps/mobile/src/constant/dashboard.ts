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
};

export type ActivityItem = {
  id: string;
  nodeId: string;
  location: string;
  lightLux: number;
  powerWh: number;
  time: string;
  thumbnailUrl?: string;
};

export type HarvestEstimate = {
  id: string;
  nodeId: string;
  ripenessPercent: number;
  daysRemaining: string;
  thumbnailUrl?: string;
};

export type ActionIssueSeverity = "critical" | "warning";

export type ActionIssue = {
  id: string;
  nodeId: string;
  title: string;
  location: string;
  icon: keyof typeof Ionicons.glyphMap;
  severity: ActionIssueSeverity;
};

export type ActionIssueGroup = {
  category: string;
  issues: ActionIssue[];
};

export const QUICK_ACTIONS: QuickAction[] = [
  { key: "action-needed", label: "Perlu Tindakan", icon: "warning-outline" },
  { key: "harvest-estimate", label: "Estimasi Panen", icon: "bicycle-outline" },
  { key: "activity", label: "Aktivitas", icon: "document-text-outline" },
];
