import React, { memo } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ListRowCard } from "@/component/ui/ListRowCard";
import { TAB_COLORS } from "@/constant/Tabs";
import type { ProfileMenuItem } from "@/constant/profile";

interface ProfileMenuProps {
  items: ProfileMenuItem[];
  onItemPress?: (key: string) => void;
}

export function ProfileMenu({ items, onItemPress }: ProfileMenuProps) {
  return (
    <View className="mx-4 mt-4">
      {items.map((item) => (
        <MenuRow
          key={item.key}
          item={item}
          onPress={() => onItemPress?.(item.key)}
        />
      ))}
    </View>
  );
}

const MenuRow = memo(function MenuRow({
  item,
  onPress,
}: {
  item: ProfileMenuItem;
  onPress: () => void;
}) {
  return (
    <ListRowCard
      onPress={onPress}
      leading={
        <View className="h-9 w-9 items-center justify-center rounded-full bg-green-50">
          <Ionicons name={item.icon} size={18} color={TAB_COLORS.active} />
        </View>
      }
      trailing={
        <View className="flex-row items-center gap-2">
          {item.meta && (
            <Text className="text-xs text-gray-400">{item.meta}</Text>
          )}
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      }
    >
      <Text className="text-sm font-medium text-gray-800">{item.label}</Text>
    </ListRowCard>
  );
});
