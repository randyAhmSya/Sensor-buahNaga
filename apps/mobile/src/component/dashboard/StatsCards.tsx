import React, { memo } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlassCard } from "@/component/ui/GlassCard";
import { colors } from "@/theme/tokens";
import type { GardenStats } from "@/constant/dashboard";

interface StatsCardsProps {
  stats: GardenStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <View className="mt-4 flex-row gap-3 px-4">
      <StatCard
        icon="leaf"
        label="Total Kebun"
        value={String(stats.totalGardens)}
        iconColor={colors.statIcon.kebun}
      />
      <StatCard
        icon="hardware-chip"
        label="Node Aktif"
        value={String(stats.activeNodes)}
        iconColor={colors.statIcon.node}
      />
      <StatCard
        icon="sync"
        label="Siklus Panen"
        value={String(stats.activeCycles)}
        iconColor={colors.statIcon.siklus}
      />
    </View>
  );
}

const StatCard = memo(function StatCard({
  icon,
  label,
  value,
  iconColor,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  iconColor: string;
}) {
  return (
    <GlassCard className="flex-1 items-center px-2 py-4" style={{ gap: 6 }}>
      {/* Hanya ikon berwarna, tanpa latar */}
      <Ionicons name={icon} size={26} color={iconColor} />
      <Text className="text-2xl font-extrabold text-slate-900">{value}</Text>
      <Text
        className="text-center text-xs font-semibold text-slate-600"
        numberOfLines={2}
      >
        {label}
      </Text>
    </GlassCard>
  );
});
