import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { TAB_COLORS } from "@/constant/Tabs";
import { PressableOpacity } from "./PressableOpacity";

interface AsyncStateViewProps {
  status: "loading" | "error";
  errorMessage?: string;
  onRetry?: () => void;
}

export function AsyncStateView({
  status,
  errorMessage,
  onRetry,
}: AsyncStateViewProps) {
  if (status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color={TAB_COLORS.active} />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center gap-3 bg-gray-50 px-8">
      <Text className="text-center text-sm text-gray-500">{errorMessage}</Text>
      {onRetry && (
        <PressableOpacity
          onPress={onRetry}
          activeOpacity={0.85}
          className="rounded-full px-5 py-2.5"
          style={{ backgroundColor: TAB_COLORS.active }}
        >
          <Text className="text-sm font-semibold text-white">Coba Lagi</Text>
        </PressableOpacity>
      )}
    </View>
  );
}
