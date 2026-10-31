import { useState, useEffect, useMemo } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useIsFocused } from "expo-router";
import { fetchNodeRingkasan } from "@/service/nodeRingkasanService";
import type { BackendNodeRingkasanDTO } from "@/types/api/nodeRingkasan.dto";
import { isValidNodeIdentifier } from "./useNodeDetails";
import { QUERY_KEYS } from "@/constant/queryKeys";

export interface UseNodeRingkasanReturn {
  ringkasan: BackendNodeRingkasanDTO | null;
  loading: boolean;
  error: string | null;
  isInvalidIdentifier: boolean;
  refetch: () => Promise<unknown>;
}

export function useNodeRingkasan(idSensor?: string): UseNodeRingkasanReturn {
  const trimmedId = idSensor?.trim() || "";
  const hasId = trimmedId.length > 0;
  const isValid = hasId && isValidNodeIdentifier(trimmedId);
  const isInvalidIdentifier = hasId && !isValid;

  const isFocused = useIsFocused();
  const [isAppActive, setIsAppActive] = useState<boolean>(() => {
    return AppState.currentState === "active";
  });

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        setIsAppActive(nextAppState === "active");
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  // Polling 30 detik HANYA saat layar fokus dan aplikasi dalam keadaan aktif
  const shouldPoll = isFocused && isAppActive;

  const {
    data,
    isPending,
    error: queryError,
    refetch,
  } = useQuery<BackendNodeRingkasanDTO, Error>({
    queryKey: QUERY_KEYS.nodeRingkasan(trimmedId),
    queryFn: () => fetchNodeRingkasan(trimmedId),
    enabled: isValid,
    staleTime: 30_000,
    refetchOnMount: false,
    refetchInterval: () => (!shouldPoll ? false : 30_000),
    refetchIntervalInBackground: false,
  });

  const error = useMemo(() => {
    if (isInvalidIdentifier) {
      return "Format kode QR tidak sesuai. ID node harus berupa kode UUID atau serial node yang valid.";
    }
    if (queryError) {
      return queryError.message || "Gagal memuat ringkasan node.";
    }
    return null;
  }, [isInvalidIdentifier, queryError]);

  return {
    ringkasan: isValid ? data || null : null,
    loading: isValid && isPending,
    error,
    isInvalidIdentifier,
    refetch,
  };
}

