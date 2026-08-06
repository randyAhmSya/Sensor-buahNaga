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
  profile: { label: "profile", icon: "person-outline", activeIcon: "person" },
  // setting: {
  //   label: "Setting",
  //   icon: "settings-outline",
  //   activeIcon: "settings",
  // },
};

export const TAB_COLORS = {
  active: "#14532D", // green-900, dark green
  inactive: "#9CA3AF", // gray-400
  scanBackground: "#14532D",
  scanIcon: "#FFFFFF",
  subTitles: "#151C25",
  subIcons: "#717970",
};
