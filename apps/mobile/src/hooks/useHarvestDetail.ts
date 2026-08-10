import { useMemo } from "react";

import { MOCK_HARVEST_DATA } from "@/constant/harvest";

export function useHarvestDetail(id?: string) {
  console.log("ID MASUK HOOK:", id);
  console.log("DATA HARVEST:", MOCK_HARVEST_DATA);

  const harvest = useMemo(() => {
    if (!id) {
      return null;
    }

    const result = MOCK_HARVEST_DATA.find((item) => item.id === id);

    console.log("HASIL FIND:", result);

    return result ?? null;
  }, [id]);

  return {
    harvest,
  };
}
