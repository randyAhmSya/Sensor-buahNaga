import React from "react";
import { View } from "react-native";
import { TAB_COLORS } from "@/constant/Tabs";

interface ProgressBarProps {
  percent: number; // 0-100
  color?: string;
}

export function ProgressBar({
  percent,
  color = TAB_COLORS.active,
}: ProgressBarProps) {
  // Clamp biar gak render aneh kalau data dari BE nanti kebetulan di luar 0-100
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <View className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
      <View
        className="h-full rounded-full"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </View>
  );
}
