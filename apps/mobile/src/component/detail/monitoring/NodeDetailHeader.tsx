import React from "react";
import { Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface Props {
  nodeId: string;
  showScanButton?: boolean;
}

export function NodeDetailHeader({ nodeId, showScanButton = true }: Props) {
  return (
    <View className="h-14 flex-row items-center justify-between bg-white px-4 border-b border-gray-100">
      <View className="flex-row items-center gap-2 flex-1 pr-2">
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)/monitoring");
            }
          }}
          className="p-1.5"
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>

        <Text
          className="text-base font-bold text-gray-900 flex-1"
          numberOfLines={1}
        >
          Detail Node: {nodeId}
        </Text>
      </View>

      {showScanButton && (
        <Pressable
          onPress={() => router.push("/scan")}
          className="flex-row items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"
          accessibilityRole="button"
          accessibilityLabel="Ganti atau scan ulang node"
        >
          <Ionicons name="scan-outline" size={14} color="#15803d" />
          <Text className="text-xs font-semibold text-emerald-800">
            Ganti Node
          </Text>
        </Pressable>
      )}
    </View>
  );
}
