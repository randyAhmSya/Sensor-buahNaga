import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Card } from "@/component/ui/Card";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  iconColor?: string;
}

export function SensorCard({ icon, label, value, iconColor }: Props) {
  return (
    <Card className="flex-1 p-4">
      <View className=" items-center flex-row gap-2">
        <Ionicons name={icon} size={28} color={iconColor} />
        <Text className=" text-xs text-gray-500">{label}</Text>
      </View>

      <Text className="mt-1 text-xl font-bold text-gray-900">{value}</Text>
    </Card>
  );
}
