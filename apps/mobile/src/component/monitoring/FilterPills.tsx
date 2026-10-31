import React, { memo } from "react";
import { ScrollView, Text } from "react-native";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import { colors, radius } from "@/theme/tokens";
import type { FilterOption } from "@/constant/monitoring";

interface FilterPillsProps {
  options: FilterOption[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export function FilterPills({
  options,
  activeKey,
  onSelect,
}: FilterPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8 }}
      className="mt-3"
    >
      {options.map((option) => (
        <FilterPill
          key={option.key}
          option={option}
          isActive={option.key === activeKey}
          onPress={() => onSelect(option.key)}
        />
      ))}
    </ScrollView>
  );
}

const FilterPill = memo(function FilterPill({
  option,
  isActive,
  onPress,
}: {
  option: FilterOption;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <PressableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        borderRadius: radius.tag,
        backgroundColor: isActive ? colors.status.success.bg : "#FFFFFF",
        borderColor: isActive ? colors.status.success.bg : "#CBD5E1",
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}
    >
      <Text
        style={{
          color: isActive ? colors.status.success.text : "#1E293B",
          fontWeight: "700",
          fontSize: 13,
        }}
      >
        {option.label}
      </Text>
    </PressableOpacity>
  );
});
