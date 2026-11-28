import React from "react";
import { Text, View } from "react-native";
import { BackButton } from "@/component/ui/BackButton";

interface Props {
  nodeId: string;
}

export function NodeDetailHeader({ nodeId }: Props) {
  return (
    <View className="h-14 flex-row items-center justify-between bg-white px-4 border-b border-gray-100">
      <View className="flex-row items-center gap-2 flex-1 pr-2">
        <BackButton fallback="/(tabs)/monitoring" />

        <Text
          className="text-base font-bold text-gray-900 flex-1"
          numberOfLines={1}
        >
          Detail Node: {nodeId}
        </Text>
      </View>
    </View>
  );
}
