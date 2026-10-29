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

export function SensorCard({ icon, label, value, iconColor = "#059669" }: Props) {
  return (
    <Card className="flex-1 p-4 border border-slate-200">
      <View className="items-center flex-row gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-200">
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <Text className="text-xs font-semibold text-slate-600">{label}</Text>
      </View>

      <Text className="mt-2 text-xl font-extrabold text-slate-900">{value}</Text>
    </Card>
  );
}
