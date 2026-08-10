import React from "react";
import { Image, Text, View } from "react-native";

export function HarvestNodeCard({ node }: any) {
  return (
    <View className="mt-4 flex-row rounded-xl bg-white p-3">
      <Image source={{ uri: node.image }} className="h-12 w-12 rounded-lg" />

      <View className="ml-3">
        <Text className="font-bold text-gray-900">Node: {node.id}</Text>

        <Text className="text-xs text-gray-500">{node.location}</Text>
      </View>
    </View>
  );
}
