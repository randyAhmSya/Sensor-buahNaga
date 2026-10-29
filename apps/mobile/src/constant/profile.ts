import { Ionicons } from "@expo/vector-icons";

export type UserProfile = {
  name: string;
  role: string;
  location: string;
  email?: string;
  avatarUrl?: string;
  totalGardens: number;
  activeNodes: number;
};

export type ProfileMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  meta?: string;
};

export const PROFILE_MENU: ProfileMenuItem[] = [
  {
    key: "account-settings",
    label: "Account Settings",
    icon: "shield-checkmark-outline",
  },
  { key: "subscription", label: "Langganan & Paket", icon: "card-outline" },
  {
    key: "notifications",
    label: "Pengaturan Notifikasi",
    icon: "notifications-outline",
  },
  {
    key: "about",
    label: "Tentang Aplikasi",
    icon: "information-circle-outline",
    meta: "v1.0.0",
  },
];
