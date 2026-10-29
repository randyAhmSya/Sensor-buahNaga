import React from "react";
import { Text, View } from "react-native";
import { Card } from "@/component/ui/Card";
import type { UserProfile } from "@/constant/profile";

interface ProfileStatsProps {
  user: UserProfile;
}

export function ProfileStats({ user }: ProfileStatsProps) {
  return (
    <Card className="mx-4 mt-3 flex-row items-center justify-around py-4 border border-slate-200 bg-white">
      <View className="items-center gap-1">
        <Text className="text-xs font-semibold text-slate-600">Total Kebun</Text>
        <Text className="text-lg font-extrabold text-slate-900">
          {user.totalGardens} Lokasi
        </Text>
      </View>

      {/* Garis pemisah vertikal */}
      <View className="h-8 w-px bg-slate-200" />

      <View className="items-center gap-1">
        <Text className="text-xs font-semibold text-slate-600">Total Node IoT</Text>
        <Text className="text-lg font-extrabold text-slate-900">
          {user.activeNodes} Aktif
        </Text>
      </View>
    </Card>
  );
}
