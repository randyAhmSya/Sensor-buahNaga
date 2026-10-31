import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radius, statusColors, type BadgeTone } from "@/theme/tokens";

export interface StatusBadgeProps {
  tone: BadgeTone;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: "sm" | "md";
  className?: string;
}

export const StatusBadge = memo(function StatusBadge({
  tone,
  label,
  icon,
  size = "sm",
  className = "",
}: StatusBadgeProps) {
  const palette = statusColors[tone] || statusColors.neutral;

  const isSmall = size === "sm";

  return (
    <View
      className={`flex-row items-center justify-center rounded-md border ${className}`}
      style={[
        styles.badge,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          paddingVertical: isSmall ? 3.5 : 4.5,
          paddingHorizontal: 10,
        },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={isSmall ? 11 : 13}
          color={palette.text}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: palette.text,
            fontSize: isSmall ? 12 : 13,
            lineHeight: isSmall ? 16 : 18,
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.tag,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "700",
  },
});

