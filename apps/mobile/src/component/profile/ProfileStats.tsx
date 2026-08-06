import React from "react";
import { Text, View } from "react-native";
import { Card } from "@/component/ui/Card";
import { TAB_COLORS } from "@/constant/Tabs";
import type { UserProfile } from "@/constant/profile";

interface ProfileStatsProps {
  user: UserProfile;
}

export function ProfileStats({ user }: ProfileStatsProps) {
  return (
    <Card className="mx-4 mt-3 flex-row items-center justify-around py-4 mb-4">
      <View className="items-center gap-1">
        <Text className="text-xs text-gray-400">Total Kebun</Text>
        <Text
          className="text-lg font-bold"
          style={{ color: TAB_COLORS.active }}
        >
          {user.totalGardens} Lokasi
        </Text>
      </View>

      {/* Garis pemisah vertikal */}
      <View className="h-8 w-px bg-gray-200" />

      <View className="items-center gap-1">
        <Text className="text-xs text-gray-400">Total Node IoT</Text>
        <Text
          className="text-lg font-bold"
          style={{ color: TAB_COLORS.active }}
        >
          {user.activeNodes} Aktif
        </Text>
      </View>
    </Card>
  );
}
