import React, { memo } from "react";
import { ScrollView, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import { colors, radius, border } from "@/theme/tokens";
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
        backgroundColor: isActive ? colors.status.success.bg : colors.text.inverse,
        borderColor: isActive ? colors.status.success.bg : colors.border.neutral,
        borderWidth: border.strong,
        borderRadius: radius.control,
        paddingHorizontal: 16,
        paddingVertical: 10,
        minHeight: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons
        name={action.icon}
        size={16}
        color={isActive ? colors.status.success.text : colors.icon.neutral}
      />

      <Text
        style={{
          marginLeft: 8,
          fontSize: 14,
          fontWeight: "600",
          color: isActive ? colors.status.success.text : colors.text.primary,
        }}
      >
        {action.label}
      </Text>
    </PressableOpacity>
  );
});
