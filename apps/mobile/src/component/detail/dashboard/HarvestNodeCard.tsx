import React from "react";

import { Image, Text, View } from "react-native";

export function HarvestNodeCard({ data }: any) {
  return (
    <View className="mt-4 flex-row rounded-xl bg-white p-3">
      <Image
        source={{
          uri: data.image,
        }}
        className="h-14 w-14 rounded-lg"
      />

      <View className="ml-3">
        <Text className="font-bold text-gray-900">Node: {data.node}</Text>

        <Text className="text-xs text-gray-500">{data.location}</Text>
      </View>
    </View>
  );
}
