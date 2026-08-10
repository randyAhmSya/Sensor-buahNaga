import React from "react";
import { Text, View } from "react-native";

export function Progress({ percent }: any) {
  return (
    <View className="mt-4 rounded-xl bg-white p-4">
      <View className="flex-row justify-between">
        <Text className="text-xs text-gray-500">Status Kematangan</Text>

        <Text className="font-bold text-green-600">
          {percent}% - Siap Panen
        </Text>
      </View>

      <View className="mt-3 h-2 rounded-full bg-gray-200">
        <View
          className="h-2 rounded-full bg-green-700"
          style={{
            width: `${percent}%`,
          }}
        />
      </View>
    </View>
  );
}
