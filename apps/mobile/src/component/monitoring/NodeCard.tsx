import React, { memo } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ListRowCard } from "@/component/ui/ListRowCard";
import type { MonitoringNode } from "@/constant/monitoring";

interface NodeCardProps {
  node: MonitoringNode;
  onPress?: () => void;
}

export const NodeCard = memo(function NodeCard({
  node,
  onPress,
}: NodeCardProps) {
  const isOnline =
    node.statusKoneksi === "online" ||
    node.statusKoneksi === "terhubung" ||
    node.status === "normal";

  const statusLabel = isOnline ? "Aktif" : "Inactive";
  const badgeTextColor = isOnline ? "#065F46" : "#9F1239";
  const badgeBgColor = isOnline ? "#ECFDF5" : "#FFF1F2";
  const badgeBorderColor = isOnline ? "#A7F3D0" : "#FECDD3";
  const iconColor = isOnline ? "#059669" : "#E11D48";
  const iconBgColor = isOnline ? "#ECFDF5" : "#FFF1F2";

  return (
    <ListRowCard
      onPress={onPress}
      leading={
        <View
          className="h-10 w-10 items-center justify-center rounded-xl border border-slate-200"
          style={{ backgroundColor: iconBgColor }}
        >
          <Ionicons
            name={isOnline ? "hardware-chip-outline" : "alert-circle-outline"}
            size={20}
            color={iconColor}
          />
        </View>
      }
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-1 mr-2" style={{ flexShrink: 1 }}>
          <Text
            className="text-sm font-bold text-slate-900"
            numberOfLines={1}
          >
            {node.code || node.id}
          </Text>
        </View>
        <View
          className="rounded-full px-2.5 py-0.5 border"
          style={{
            backgroundColor: badgeBgColor,
            borderColor: badgeBorderColor,
          }}
        >
          <Text
            className="text-[10px] font-bold"
            style={{ color: badgeTextColor }}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <Text className="mt-0.5 text-xs text-slate-600" numberOfLines={1}>
        {node.location || "Blok Kebun"}
      </Text>

      <View className="mt-1.5 flex-row items-center gap-3">
        <View className="flex-row items-center gap-1">
          <Ionicons name="thermometer-outline" size={12} color="#475569" />
          <Text className="text-xs font-semibold text-slate-700">
            {node.temperatureC != null ? `${node.temperatureC}°C` : "-"}
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          <Ionicons name="sunny-outline" size={12} color="#475569" />
          <Text className="text-xs font-semibold text-slate-700">
            {node.lightLux != null ? `${node.lightLux} Lux` : "-"}
          </Text>
        </View>

        <View className="flex-row items-center gap-1 ml-auto">
          <Ionicons name="time-outline" size={11} color="#64748B" />
          <Text className="text-[11px] font-medium text-slate-600">{node.time}</Text>
        </View>
      </View>
    </ListRowCard>
  );
});
