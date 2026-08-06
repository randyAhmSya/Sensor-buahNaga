import React, { memo } from "react";
import { ScrollView, Text } from "react-native";
import { TAB_COLORS } from "@/constant/Tabs";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
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

// Beda sama ActionPill di QuickActions.tsx: yang ini single-select (cuma 1
// yang aktif dalam satu waktu, di-drive dari `activeKey` orang tua), bukan
// tombol aksi lepas -- makanya sengaja gak digabung jadi 1 komponen sama itu.
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
      className="rounded-full px-4 py-2"
      style={{ backgroundColor: isActive ? TAB_COLORS.active : "#F3F4F6" }}
    >
      <Text
        className="text-sm font-medium"
        style={{ color: isActive ? "#FFFFFF" : "#374151" }}
      >
        {option.label}
      </Text>
    </PressableOpacity>
  );
});
