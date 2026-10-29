import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProfileData, type ProfileData } from "@/service/profileService";
import { QUERY_KEYS } from "@/constant/queryKeys";

export type ProfileState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: ProfileData };

export interface UseProfileReturn {
  state: ProfileState;
  refetch: () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const {
    data,
    isPending,
    isError,
    error,
    refetch: queryRefetch,
  } = useQuery<ProfileData, Error>({
    queryKey: QUERY_KEYS.profile.all,
    queryFn: fetchProfileData,
  });

  const state: ProfileState = useMemo(() => {
    if (isPending) {
      return { status: "loading" };
    }
    if (isError) {
      return {
        status: "error",
        message: error?.message || "Gagal memuat profil",
      };
    }
    if (data) {
      return { status: "success", data };
    }
    return { status: "loading" };
  }, [isPending, isError, error, data]);

  const refetch = async (): Promise<void> => {
    await queryRefetch();
  };

  return { state, refetch };
}
