import React, { memo } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ListRowCard } from "@/component/ui/ListRowCard";
import { TAB_COLORS } from "@/constant/Tabs";
import type { MonitoringNode } from "@/constant/monitoring";

interface NodeCardProps {
  node: MonitoringNode;
  onPress?: () => void;
}

export const NodeCard = memo(function NodeCard({
  node,
  onPress,
}: NodeCardProps) {
  const isProblem = node.status === "problem";
  const statusColor = isProblem ? "#DC2626" : TAB_COLORS.active;
  const statusBg = isProblem ? "#DC2626" : "#14532D";

  return (
    <ListRowCard
      onPress={onPress}
      leading={
        <View
          className="h-10 w-10 items-center justify-center rounded-xl border-2"
          style={{ borderColor: statusBg }}
        >
          <Ionicons
            name={isProblem ? "warning" : "wifi"}
            size={18}
            color={statusColor}
          />
        </View>
      }
    >
      <View className="flex-row items-center gap-2">
        <Text className="text-sm font-semibold text-gray-900">
          Scan Node: {node.id}
        </Text>
        <View
          className="rounded-2xl px-2 py-0.5"
          style={{ borderColor: statusBg }}
        >
          <Text
            className="text-[10px] font-semibold"
            style={{ color: statusColor }}
          >
            {isProblem ? "Bermasalah" : "Normal"}
          </Text>
        </View>
      </View>

      <Text className="mt-0.5 text-xs text-gray-500">
        {node.location} • Pukul {node.time} •{" "}
        <Text
          style={{
            color: isProblem ? statusColor : "#6B7280",
            fontWeight: isProblem ? "700" : "400",
          }}
        >
          Suhu: {node.temperatureC}°C{isProblem ? " (High)" : ""}
        </Text>
        {node.lightLux != null && ` • Lux: ${node.lightLux}`}
      </Text>
    </ListRowCard>
  );
});
