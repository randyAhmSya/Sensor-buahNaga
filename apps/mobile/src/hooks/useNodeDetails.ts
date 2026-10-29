import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NodeDetail } from "@/constant/NodeDetails";
import { fetchNodeDetail } from "@/service/nodeDetailService";
import { QUERY_KEYS } from "@/constant/queryKeys";

// Regex validasi: mendukung format UUID standar 36-karakter, format kode fisik QR-NODE-XXXXXX, atau kode perangkat alfanumerik (3-64 karakter)
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NODE_CODE_REGEX = /^QR-NODE-[A-Za-z0-9_-]+$/i;
const ALPHANUMERIC_ID_REGEX = /^[A-Za-z0-9_-]{3,64}$/;

export function isValidNodeIdentifier(id?: string): boolean {
  if (!id) return false;
  const trimmed = id.trim();
  return (
    UUID_REGEX.test(trimmed) ||
    NODE_CODE_REGEX.test(trimmed) ||
    ALPHANUMERIC_ID_REGEX.test(trimmed)
  );
}

export interface UseNodeDetailReturn {
  node: NodeDetail | null;
  loading: boolean;
  error: string | null;
  isInvalidUuid: boolean;
  isInvalidIdentifier: boolean;
  refetch: () => Promise<void>;
}

export function useNodeDetail(id?: string): UseNodeDetailReturn {
  const trimmedId = id?.trim() || "";
  const hasId = trimmedId.length > 0;
  const isValid = hasId && isValidNodeIdentifier(trimmedId);
  const isInvalidIdentifier = hasId && !isValid;

  const {
    data,
    isPending,
    error: queryError,
    refetch: queryRefetch,
  } = useQuery<NodeDetail | null, Error>({
    queryKey: QUERY_KEYS.nodes.detail(trimmedId),
    queryFn: () => fetchNodeDetail(trimmedId),
    enabled: isValid,
  });

  const error = useMemo(() => {
    if (isInvalidIdentifier) {
      return "Format kode QR tidak sesuai. ID node harus berupa kode UUID atau serial node yang valid.";
    }
    if (queryError) {
      return queryError.message || "Gagal memuat detail node.";
    }
    return null;
  }, [isInvalidIdentifier, queryError]);

  const loading = isValid && isPending;
  const node = isValid ? data || null : null;

  const refetch = async (): Promise<void> => {
    if (isValid) {
      await queryRefetch();
    }
  };

  return {
    node,
    loading,
    error,
    isInvalidUuid: isInvalidIdentifier,
    isInvalidIdentifier,
    refetch,
  };
}
