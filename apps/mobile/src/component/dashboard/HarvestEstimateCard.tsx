import React, { memo } from "react";
import { Image, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ListRowCard } from "@/component/ui/ListRowCard";
import { ProgressBar } from "@/component/ui/ProgressBar";
import type { HarvestEstimate } from "@/constant/dashboard";

interface HarvestEstimateCardProps {
  item: HarvestEstimate;
  onPress?: () => void;
}

export const HarvestEstimateCard = memo(function HarvestEstimateCard({
  item,
  onPress,
}: HarvestEstimateCardProps) {
  return (
    <ListRowCard
      onPress={onPress}
      leading={
        <Image
          source={{ uri: item.thumbnailUrl }}
          className="h-12 w-12 rounded-xl"
        />
      }
      trailing={
        <View className="items-end gap-2">
          <Text className="text-xs text-gray-400">{item.daysRemaining}</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      }
    >
      <Text className="text-sm font-semibold text-gray-900">
        Node: {item.nodeId}
      </Text>
      <Text className="text-xs text-gray-500">
        Kematangan: {item.ripenessPercent}%
      </Text>
      <View className="mt-1.5">
        <ProgressBar percent={item.ripenessPercent} />
      </View>
    </ListRowCard>
  );
});
