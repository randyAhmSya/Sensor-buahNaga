import React, { memo } from "react";
import { ScrollView, Text, View } from "react-native";
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
    <View className="">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 8,
          paddingHorizontal: 16,
          alignItems: "center",
        }}
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
    </View>
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
  // const isPrimary = true;

  return (
    <PressableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: isPrimary ? TAB_COLORS.active : "#F3F4F6",
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
        color={isPrimary ? "#FFFFFF" : "#374151"}
      />

      <Text
        style={{
          marginLeft: 8,
          fontSize: 14,
          fontWeight: "600",
          color: isPrimary ? "#FFFFFF" : "#374151",
        }}
      >
        {action.label}
      </Text>
    </PressableOpacity>
  );
});
