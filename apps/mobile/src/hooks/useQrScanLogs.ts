import { useQuery } from "@tanstack/react-query";
import { fetchQrScanLogs, type QrScanLogItem } from "@/service/qrScanService";
import { QUERY_KEYS } from "@/constant/queryKeys";

export function useQrScanLogs() {
  const {
    data: logs = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery<QrScanLogItem[], Error>({
    queryKey: QUERY_KEYS.qr.logs,
    queryFn: fetchQrScanLogs,
    staleTime: 0,
    refetchOnMount: "always",
  });

  return {
    logs,
    isPending,
    isError,
    error,
    refetch,
  };
}
