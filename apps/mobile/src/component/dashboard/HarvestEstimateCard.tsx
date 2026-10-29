import React, { memo } from "react";
import { Text, View } from "react-native";
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
        <View className="h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200">
          <Ionicons name="leaf-outline" size={20} color="#059669" />
        </View>
      }
      trailing={
        <View className="items-end gap-1">
          <Text className="text-xs font-semibold text-slate-600">{item.daysRemaining}</Text>
          <Ionicons name="chevron-forward" size={16} color="#64748B" />
        </View>
      }
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-1 mr-2" style={{ flexShrink: 1 }}>
          <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
            {item.nodeId}
          </Text>
        </View>
        <Text className="text-xs font-bold text-emerald-800">
          {item.ripenessPercent}%
        </Text>
      </View>
      <View className="mt-1.5">
        <ProgressBar percent={item.ripenessPercent} />
      </View>
    </ListRowCard>
  );
});
