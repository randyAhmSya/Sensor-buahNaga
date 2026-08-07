import React, { memo } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ListRowCard } from "@/component/ui/ListRowCard";
import type { ActionIssue } from "@/constant/dashboard";

interface ActionIssueCardProps {
  issue: ActionIssue;
  onPress?: () => void;
}

export const ActionIssueCard = memo(function ActionIssueCard({
  issue,
  onPress,
}: ActionIssueCardProps) {
  const isCritical = issue.severity === "critical";
  const accentColor = isCritical ? "#DC2626" : "#D97706";
  const accentBg = isCritical ? "#FEE2E2" : "#FEF3C7";

  return (
    <ListRowCard
      onPress={onPress}
      leading={
        <View className="relative">
          <View
            className="h-10 w-10 items-center justify-center rounded-xl border-2"
            style={{ borderColor: accentBg }}
          >
            <Ionicons name={issue.icon} size={18} color={accentColor} />
          </View>
          <View
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white"
            style={{ backgroundColor: accentColor }}
          />
        </View>
      }
    >
      <Text className="text-xs text-gray-400">Node: {issue.nodeId}</Text>
      <Text className="text-sm font-semibold text-gray-900">{issue.title}</Text>
      <View className="mt-0.5 flex-row items-center gap-1">
        <Ionicons name="location-outline" size={11} color="#9CA3AF" />
        <Text className="text-xs text-gray-400">{issue.location}</Text>
      </View>
    </ListRowCard>
  );
});
