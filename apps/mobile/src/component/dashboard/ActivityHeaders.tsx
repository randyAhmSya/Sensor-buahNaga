import React from "react";
import { Text, View } from "react-native";
import { TAB_COLORS } from "@/constant/Tabs";
import { PressableOpacity } from "@/component/ui/PressableOpacity";

interface ActivityHeaderProps {
  onSeeAllPress?: () => void;
}

export function ActivityHeaders({ onSeeAllPress }: ActivityHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between pt-4 px-4">
      <Text className="text-lg font-bold text-gray-900">Aktivitas Terbaru</Text>

      <PressableOpacity onPress={onSeeAllPress} hitSlop={8}>
        <Text
          className="text-sm font-medium"
          style={{ color: TAB_COLORS.active }}
        >
          Lihat Semua
        </Text>
      </PressableOpacity>
    </View>
  );
}
