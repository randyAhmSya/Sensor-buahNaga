import React, { memo } from "react";
import { Image, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/component/ui/Card";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import type { ActivityItem } from "@/constant/dashboard";

interface ActivityCardProps {
  activity: ActivityItem;
  onPress?: () => void;
}

export const ActivityCard = memo(function ActivityCard({
  activity,
  onPress,
}: ActivityCardProps) {
  return (
    <PressableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card className="mb-3 flex-row items-center gap-3 p-3">
        <Image
          source={{ uri: activity.thumbnailUrl }}
          className="h-12 w-12 rounded-xl"
        />

        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900">
            Node: {activity.nodeId}
          </Text>
          <Text className="text-xs text-gray-500">
            Location: {activity.location}
          </Text>
          <Text className="text-xs text-gray-500">
            Light: {activity.lightLux} Lux | Power: {activity.powerWh} Wh
          </Text>
        </View>

        <View className="items-end gap-2">
          <Text className="text-xs text-gray-400">{activity.time}</Text>
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </View>
      </Card>
    </PressableOpacity>
  );
});
