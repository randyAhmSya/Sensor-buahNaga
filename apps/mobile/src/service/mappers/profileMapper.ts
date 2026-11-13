import { PROFILE_MENU, type UserProfile } from "@/constant/profile";
import type { ProfileData } from "@/service/profileService";
import type { BackendKebunDTO, BackendSensorDTO } from "@/types/api";
import { FITUR_LANGGANAN } from "@/config/features";

interface CurrentUserContext {
  nama_lengkap?: string;
  email?: string;
  role?: string;
  location?: string;
  avatarUrl?: string;
}

export function mapToProfileData({
  currentUser,
  kebuns,
  nodes = [],
  activeNodesCount,
}: {
  currentUser?: CurrentUserContext | null;
  kebuns: BackendKebunDTO[];
  nodes?: BackendSensorDTO[];
  activeNodesCount?: number;
}): ProfileData {
  const totalGardens = kebuns.length;
  const activeNodes =
    activeNodesCount !== undefined
      ? activeNodesCount
      : nodes.filter(
          (n) => n.status_koneksi === "online" || n.status_koneksi === "terhubung",
        ).length;

  const firstLocation =
    kebuns[0]?.lokasi_kebun ||
    currentUser?.location ||
    "Lokasi belum diatur";

  const formatRoleLabel = (rawRole?: string): string => {
    if (!rawRole) return "";
    const normalized = rawRole.toLowerCase().trim();
    if (normalized === "superadmin" || normalized === "super_admin" || normalized === "super admin") {
      return "Super Admin";
    }
    if (normalized === "admin") {
      return "Admin";
    }
    if (normalized === "petani" || normalized === "petani_biasa") {
      return "Petani";
    }
    return rawRole
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const user: UserProfile = {
    name: currentUser?.nama_lengkap || "Pengguna",
    email: currentUser?.email,
    role: formatRoleLabel(currentUser?.role),
    location: firstLocation,
    avatarUrl: undefined,
    totalGardens,
    activeNodes,
  };

  const filteredMenu = FITUR_LANGGANAN
    ? PROFILE_MENU
    : PROFILE_MENU.filter((item) => item.key !== "subscription");

  return {
    user,
    menu: filteredMenu,
  };
}
