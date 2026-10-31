import React, { memo } from "react";
import { ScrollView, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import { colors, radius } from "@/theme/tokens";
import type { QuickAction } from "@/constant/dashboard";

interface QuickActionsProps {
  actions: QuickAction[];
  activeKey?: string;
  onActionPress?: (key: string) => void;
}

export function QuickActions({
  actions,
  activeKey,
  onActionPress,
}: QuickActionsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: 8,
      }}
      className="mt-2"
    >
      {actions.map((action) => (
        <ActionPill
          key={action.key}
          action={action}
          isActive={activeKey === action.key}
          onPress={() => onActionPress?.(action.key)}
        />
      ))}
    </ScrollView>
  );
}

const ActionPill = memo(function ActionPill({
  action,
  onPress,
  isActive,
}: {
  action: QuickAction;
  onPress: () => void;
  isActive: boolean;
}) {
  return (
    <PressableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: isActive ? colors.status.success.bg : "#FFFFFF",
        borderColor: isActive ? colors.status.success.bg : "#CBD5E1",
        borderWidth: 1,
        borderRadius: radius.control,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Ionicons
        name={action.icon}
        size={16}
        color={isActive ? colors.status.success.text : "#1E293B"}
      />

      <Text
        style={{
          marginLeft: 8,
          fontSize: 14,
          fontWeight: "600",
          color: isActive ? colors.status.success.text : "#1E293B",
        }}
      >
        {action.label}
      </Text>
    </PressableOpacity>
  );
});
