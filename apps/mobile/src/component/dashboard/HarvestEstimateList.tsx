import React from "react";
import { Text, View } from "react-native";
import { TAB_COLORS } from "@/constant/Tabs";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import type { HarvestEstimate } from "@/constant/dashboard";
import { HarvestEstimateCard } from "./HarvestEstimateCard";

interface HarvestEstimateListProps {
  items: HarvestEstimate[];
  onSeeAllPress?: () => void;
  onItemPress?: (id: string) => void;
}

export function HarvestEstimateList({
  items,
  onSeeAllPress,
  onItemPress,
}: HarvestEstimateListProps) {
  return (
    <View className="">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-900">Estimasi Panen</Text>
        <PressableOpacity onPress={onSeeAllPress} hitSlop={8}>
          <Text
            className="text-sm font-medium"
            style={{ color: TAB_COLORS.active }}
          >
            Lihat Semua
          </Text>
        </PressableOpacity>
      </View>

      {items.slice(0, 8).map((item) => (
        <HarvestEstimateCard
          key={item.id}
          item={item}
          onPress={() => onItemPress?.(item.nodeId)}
        />
      ))}
    </View>
  );
}
