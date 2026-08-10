import { Stack, useLocalSearchParams } from "expo-router";

import { HarvestDetailScreen } from "@/component/detail/dashboard/HarvestDetailScreen";

export default function HarvestRoute() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  console.log("HARVEST ROUTE ID:", id);
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <HarvestDetailScreen nodeId={id} />
    </>
  );
}
