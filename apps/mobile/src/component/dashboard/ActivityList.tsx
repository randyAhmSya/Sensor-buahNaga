import React from "react";
import { Text, View } from "react-native";
import { TAB_COLORS } from "@/constant/Tabs";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import type { ActivityItem } from "@/constant/dashboard";
import { ActivityCard } from "./ActivityCard";

interface ActivityListProps {
  activities: ActivityItem[];
  onItemPress?: (id: string) => void;
}

export function ActivityList({ activities, onItemPress }: ActivityListProps) {
  return (
    <View className="px-4 pt-1">
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
