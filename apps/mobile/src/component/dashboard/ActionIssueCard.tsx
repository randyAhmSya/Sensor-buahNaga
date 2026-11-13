import React, { memo } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ListRowCard } from "@/component/ui/ListRowCard";
import type { ActionIssue } from "@/constant/dashboard";
import { colors } from "@/theme/tokens";

interface ActionIssueCardProps {
  issue: ActionIssue;
  onPress?: () => void;
}

export const ActionIssueCard = memo(function ActionIssueCard({
  issue,
  onPress,
}: ActionIssueCardProps) {
  const isCritical = issue.severity === "critical";
  const accentColor = isCritical ? colors.status.danger.bg : colors.border.warning;

  return (
    <ListRowCard
      onPress={onPress}
      leading={
        <View className="relative">
          <View
            className="h-10 w-10 items-center justify-center rounded-lg bg-white border-[1.5px]"
            style={{ borderColor: accentColor }}
          >
            <Ionicons name={issue.icon} size={18} color={colors.icon.neutral} />
          </View>
          <View
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white"
            style={{ backgroundColor: accentColor }}
          />
        </View>
      }
    >
      <Text className="text-xs font-medium text-slate-600">Node: {issue.nodeId}</Text>
      <Text className="text-sm font-semibold text-slate-900">{issue.title}</Text>
      <View className="mt-0.5 flex-row items-center gap-1">
        <Ionicons name="location-outline" size={12} color={colors.icon.muted} />
        <Text className="text-xs text-slate-600">{issue.location}</Text>
      </View>
    </ListRowCard>
  );
});
