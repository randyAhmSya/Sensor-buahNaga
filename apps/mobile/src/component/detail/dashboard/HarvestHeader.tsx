import React from "react";
import { View, Text, Pressable } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

interface Props {
  node: string;
}

export function HarvestHeader({ node }: Props) {
  return (
    <View className="h-14 flex-row items-center justify-between bg-white px-4">
      <Pressable
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          }
        }}
      >
        <Ionicons name="arrow-back" size={22} />
      </Pressable>

      <Text className="font-bold text-gray-900">Detail Panen: {node}</Text>

      <View className="w-6" />
    </View>
  );
}
