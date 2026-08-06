import React from "react";
import { Text, View } from "react-native";

interface GroupedSectionProps {
  label: string;
  children: React.ReactNode;
  uppercase?: boolean;
}

export function GroupedSection({
  label,
  children,
  uppercase = false,
}: GroupedSectionProps) {
  return (
    <View>
      <Text
        className={`mb-2 text-xs font-semibold text-gray-400 ${uppercase ? "uppercase tracking-wide" : ""}`}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}
