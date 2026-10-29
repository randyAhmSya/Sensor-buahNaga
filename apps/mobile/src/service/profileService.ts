import apiClient from "./apiClient";
import { authStorage } from "./authStorage";
import {
  PROFILE_MENU,
  type ProfileMenuItem,
  type UserProfile,
} from "@/constant/profile";
import type { BackendKebunDTO, BackendSensorDTO } from "@/types/api";
import { mapToProfileData } from "./mappers/profileMapper";

export interface ProfileData {
  user: UserProfile;
  menu: ProfileMenuItem[];
}

/**
 * Mengonsumsi data profil user dan ringkasan kebun/node dari API Backend Laravel (AgroLight) via DTO & Mapper.
 */
export async function fetchProfileData(): Promise<ProfileData> {
  const currentUser = authStorage.getUser();

  let kebuns: BackendKebunDTO[] = [];
  let allNodes: BackendSensorDTO[] = [];

  try {
    const kebunRes = await apiClient.get<{
      status: string;
      data: BackendKebunDTO[];
    }>("/petani/kebun");
    kebuns = kebunRes.data?.data || [];

    if (kebuns.length > 0) {
      const nodePromises = kebuns.map((k) =>
        apiClient
          .get<{ status: string; data: BackendSensorDTO[] }>("/petani/node", {
            params: { kebun_id: k.id_kebun },
          })
          .then((r) => r.data?.data || [])
          .catch(() => [] as BackendSensorDTO[]),
      );

      const nodeResults = await Promise.all(nodePromises);
      allNodes = nodeResults.flat();
    }
  } catch {
    // Jika belum login atau token belum terpasang, biarkan array kosong
  }

  return mapToProfileData({
    currentUser,
    kebuns,
    nodes: allNodes,
  });
}
