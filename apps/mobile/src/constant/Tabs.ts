import monitoring from "@/app/(tabs)/monitoring";
import { Ionicons } from "@expo/vector-icons";

// Key di sini HARUS sama persis dengan nama file route di app/(tabs)/
export const TAB_CONFIG: Record<
  string,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
  }
> = {
  index: { label: "Home", icon: "home-outline", activeIcon: "home" },
  monitoring: {
    label: "Monitoring",
    icon: "server-outline",
    activeIcon: "server",
  },
  profile: { label: "Profil", icon: "person-outline", activeIcon: "person" },
  // setting: {
  //   label: "Setting",
  //   icon: "settings-outline",
  //   activeIcon: "settings",
  // },
};

export const TAB_COLORS = {
  active: "#047857", // emerald-700
  inactive: "#475569", // Slate-600
  scanBackground: "#047857",
  scanIcon: "#FFFFFF",
  subTitles: "#151C25",
  subIcons: "#717970",
};
