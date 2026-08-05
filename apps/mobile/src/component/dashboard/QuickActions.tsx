import React, { memo } from "react";
import { ScrollView, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TAB_COLORS } from "@/constant/Tabs";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import type { QuickAction } from "@/constant/dashboard";

interface QuickActionsProps {
  actions: QuickAction[];
  onActionPress?: (key: string) => void;
}

export function QuickActions({ actions, onActionPress }: QuickActionsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
      className="mt-4"
    >
      {actions.map((action) => (
        <ActionPill
          key={action.key}
          action={action}
          onPress={() => onActionPress?.(action.key)}
        />
      ))}
    </ScrollView>
  );
}

const ActionPill = memo(function ActionPill({
  action,
  onPress,
}: {
  action: QuickAction;
  onPress: () => void;
}) {
  const isPrimary = action.variant === "primary";

  return (
    <PressableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="flex-row items-center gap-2 rounded-full px-4 py-2.5"
      style={{ backgroundColor: isPrimary ? TAB_COLORS.active : "#F3F4F6" }}
    >
      <Ionicons
        name={action.icon}
        size={16}
        color={isPrimary ? "#FFFFFF" : "#374151"}
      />
      <Text
        className="text-sm font-medium"
        style={{ color: isPrimary ? "#FFFFFF" : "#374151" }}
      >
        {action.label}
      </Text>
    </PressableOpacity>
  );
});
