import { useMemo } from "react";
import { MOCK_NODE_DETAILS } from "@/constant/NodeDetails";

export function useNodeDetail(id?: string) {
  const node = useMemo(() => {
    if (!id) return null;

    return MOCK_NODE_DETAILS.find((item) => item.id === id) ?? null;
  }, [id]);

  return {
    node,
    loading: false,
    error: null,
  };
}
