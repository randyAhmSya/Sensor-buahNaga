import React, { memo } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/component/ui/Card";
import type { GardenStats } from "@/constant/dashboard";

interface StatsCardsProps {
  stats: GardenStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <View className="mt-4 flex-row gap-3 px-4">
      <StatCard
        icon="leaf-outline"
        label="Total Kebun"
        value={String(stats.totalGardens)}
      />
      <StatCard
        icon="hardware-chip-outline"
        label="Node Aktif"
        value={String(stats.activeNodes)}
      />
      <StatCard
        icon="shield-checkmark-outline"
        label="Kesehatan"
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
    <Card className="flex-1 items-center gap-1.5 p-3.5">
      <View className="h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
        <Ionicons name={icon} size={18} color="#059669" />
      </View>
      <Text className="text-center text-[11px] font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </Text>
      <Text className="text-lg font-extrabold text-slate-900">{value}</Text>
    </Card>
  );
});
