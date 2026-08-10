import React from "react";
import { Text, View } from "react-native";

import { Card } from "@/component/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { TAB_COLORS } from "@/constant/Tabs";

interface Props {
  schedule: {
    start: string;
    end: string;
    status: string;
  };
}

export function LightingScheduleCard({ schedule }: Props) {
  return (
    <Card className="p-4">
      <View className="flex-row items-center justify-between ">
        <Text className="font-bold text-xs text-gray-900">Jadwal Lampu</Text>
        <View
          className="rounded-full flex-row border-2 py-1 px-2 items-center gap-1.5"
          style={{ borderColor: TAB_COLORS.active }}
        >
          <Ionicons name="ellipse" color={TAB_COLORS.active} />
          <Text
            className="text-center font-semibold"
            style={{ color: TAB_COLORS.active }}
          >
            {schedule.status}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <View>
          <Text className="text-xs text-gray-500">START</Text>

          <Text className="text-xl font-bold">{schedule.start}</Text>
        </View>

        <Ionicons name="arrow-forward" size={28} color="#9CA3AF" />

        <View>
          <Text className="text-xs text-gray-500">END</Text>

          <Text className="text-xl font-bold">{schedule.end}</Text>
        </View>
      </View>
    </Card>
  );
}
