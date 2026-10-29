import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { NodeDetailScreen } from "@/component/detail/monitoring/NodeDetailScreen";

export default function NodeDetailRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  // Sanitasi ID agar tidak menerima literal string "undefined", "null", atau whitespace
  const sanitizedId =
    typeof id === "string" &&
    id !== "undefined" &&
    id !== "null" &&
    id.trim() !== ""
      ? id.trim()
      : undefined;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <NodeDetailScreen nodeId={sanitizedId} />
    </>
  );
}
