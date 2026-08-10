import { Stack, useLocalSearchParams } from "expo-router";

import { NodeDetailScreen } from "@/component/detail/monitoring/NodeDetailScreen";
import { useNodeDetail } from "@/hooks/useNodeDetails";

export default function NodeDetailRoute() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  console.log("PARAM ID:", id);

  const { node } = useNodeDetail(id);

  console.log("NODE DETAIL:", node);

  if (!node) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <NodeDetailScreen nodeId={id} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <NodeDetailScreen nodeId={id} />
    </>
  );
}
