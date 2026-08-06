import { Ionicons } from "@expo/vector-icons";

export type UserProfile = {
  name: string;
  role: string;
  location: string;
  avatarUrl: string;
  totalGardens: number;
  activeNodes: number;
};

export type ProfileMenuItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  meta?: string; // contoh: "v1.0.0" buat item "Tentang Aplikasi"
};

export const MOCK_PROFILE: UserProfile = {
  name: "Randy",
  role: "Pemilik Kebun & Pengelola IoT",
  location: "Banyuwangi, Jawa Timur",
  avatarUrl: "https://i.pravatar.cc/150?u=randy-agrolight",
  totalGardens: 2,
  activeNodes: 15,
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
