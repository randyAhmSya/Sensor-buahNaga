import { useCallback, useEffect, useState } from "react";
import { fetchProfileData, type ProfileData } from "@/service/profileService";

type ProfileState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: ProfileData };

interface UseProfileReturn {
  state: ProfileState;
  refetch: () => void;
}

export function useProfile(): UseProfileReturn {
  const [state, setState] = useState<ProfileState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data = await fetchProfileData();
      setState({ status: "success", data });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Gagal memuat profil",
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { state, refetch: load };
}
