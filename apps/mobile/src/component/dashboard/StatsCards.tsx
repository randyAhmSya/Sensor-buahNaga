import React, { memo } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TAB_COLORS } from "@/constant/Tabs";
import { Card } from "@/component/ui/Card";
import type { GardenStats } from "@/constant/dashboard";

interface StatsCardsProps {
  stats: GardenStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <View className="-mt-8 flex-row gap-3 px-4">
      <StatCard
        icon="leaf-outline"
        label="Total Gardens"
        value={String(stats.totalGardens)}
      />
      <StatCard
        icon="hardware-chip-outline"
        label="Active Nodes"
        value={String(stats.activeNodes)}
      />
      <StatCard
        icon="shield-checkmark-outline"
        label="Avg. Health"
        value={`${stats.avgHealthPercent}%`}
      />
    </View>
  );
}

const StatCard = memo(function StatCard({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex-1 items-center gap-1 px-2 py-4">
      <Ionicons name={icon} size={20} color={TAB_COLORS.active} />
      <Text className="text-center text-[10px] font-medium uppercase text-gray-400">
        {label}
      </Text>
      <Text className="text-lg font-bold text-gray-900">{value}</Text>
    </Card>
  );
});
