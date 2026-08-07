import React, { memo } from "react";
import { ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TAB_COLORS } from "@/constant/Tabs";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
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
        backgroundColor: isActive ? TAB_COLORS.active : "#F3F4F6",
        borderRadius: 999,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Ionicons
        name={action.icon}
        size={16}
        color={isActive ? "#FFFFFF" : "#374151"}
      />

      <Text
        style={{
          marginLeft: 8,
          fontSize: 14,
          fontWeight: "600",
          color: isActive ? "#FFFFFF" : "#374151",
        }}
      >
        {action.label}
      </Text>
    </PressableOpacity>
  );
});
