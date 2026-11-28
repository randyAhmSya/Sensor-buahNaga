import React from "react";
import { View, Text } from "react-native";
import { BackButton } from "@/component/ui/BackButton";

interface Props {
  node: string;
}

export function HarvestHeader({ node }: Props) {
  return (
    <View className="h-14 flex-row items-center justify-between bg-white px-4 border-b border-gray-100">
      <BackButton fallback="/(tabs)" />

      <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>
        Siklus Panen: {node}
      </Text>

      <View className="w-9" />
    </View>
  );
}
