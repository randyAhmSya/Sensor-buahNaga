import React from "react";
import { Text, View } from "react-native";
import { TAB_COLORS } from "@/constant/Tabs";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import type { ActivityItem } from "@/constant/dashboard";
import { ActivityCard } from "./ActivityCard";

interface ActivityListProps {
  activities: ActivityItem[];
  onSeeAllPress?: () => void;
  onItemPress?: (id: string) => void;
}

export function ActivityList({
  activities,
  onSeeAllPress,
  onItemPress,
}: ActivityListProps) {
  return (
    <View className="px-4 pt-6">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-900">
          Aktivitas Terbaru
        </Text>
        <PressableOpacity onPress={onSeeAllPress} hitSlop={8}>
          <Text
            className="text-sm font-medium"
            style={{ color: TAB_COLORS.active }}
          >
            Lihat Semua
          </Text>
        </PressableOpacity>
      </View>

      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onPress={() => onItemPress?.(activity.id)}
        />
      ))}
    </View>
  );
}
