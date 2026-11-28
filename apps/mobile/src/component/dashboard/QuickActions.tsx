import React, { memo } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
        paddingVertical: 12,
        paddingHorizontal: 4,
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
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      style={({ pressed }) => ({
        backgroundColor: isActive
          ? colors.status.success.bg
          : pressed
            ? colors.pill.pressedBg
            : colors.pill.idleBg,
        borderColor: isActive
          ? colors.status.success.bg
          : pressed
            ? colors.pill.pressedBorder
            : colors.pill.idleBorder,
        borderWidth: 1,
        borderRadius: radius.full,
        paddingHorizontal: 18,
        paddingVertical: 10,
        minHeight: 44,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        transform: [{ scale: pressed ? 0.96 : 1 }],
        boxShadow: isActive ? colors.pill.activeShadow : colors.pill.idleShadow,
      })}
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
    </Pressable>
  );
});
