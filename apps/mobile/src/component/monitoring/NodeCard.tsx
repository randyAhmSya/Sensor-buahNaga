import React, { memo } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ListRowCard } from "@/component/ui/ListRowCard";
import { StatusBadge } from "@/component/ui/StatusBadge";
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
    node.statusKoneksi === "terhubung";

  const isBelumTerlihat =
    node.statusKoneksi === "belum_pernah_terlihat" ||
    (!isOnline && (!node.time || node.time === "-" || node.time === "Belum ada data"));

  let tone: "success" | "danger" | "neutral" = "danger";
  let statusLabel = "Offline";
  let iconColor = "#DC2626";

  if (isOnline) {
    statusLabel = "Online";
    tone = "success";
    iconColor = "#047857";
  } else if (isBelumTerlihat) {
    statusLabel = "Belum Terlihat";
    tone = "neutral";
    iconColor = "#475569";
  }

  const displayTime =
    !node.time || node.time === "-" || node.time === "Belum ada data"
      ? "Belum ada data"
      : node.time;

  return (
    <ListRowCard
      onPress={onPress}
      leading={
        <View
          className="h-10 w-10 items-center justify-center rounded-lg border-[1.5px] border-slate-400 bg-white"
        >
          <Ionicons
            name={
              isOnline
                ? "hardware-chip-outline"
                : isBelumTerlihat
                  ? "help-circle-outline"
                  : "alert-circle-outline"
            }
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
        <StatusBadge tone={tone} label={statusLabel} size="sm" />
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
          <Text className="text-[11px] font-medium text-slate-600">
            {displayTime}
          </Text>
        </View>
      </View>
    </ListRowCard>
  );
});
