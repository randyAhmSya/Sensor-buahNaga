import React from "react";
import { Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface Props {
  nodeId: string;
}

export function NodeDetailHeader({ nodeId }: Props) {
  return (
    <View className="h-14 flex-row items-center gap-2.5 bg-white px-4 border-b border-gray-100">
      <Pressable
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/(tabs)/monitoring");
          }
        }}
        className="p-2"
      >
        <Ionicons name="arrow-back" size={24} color="#1F2937" />
      </Pressable>

      <Text className="text-base font-bold text-gray-900">
        Detail Node: {nodeId}
      </Text>
    </View>
  );
}
