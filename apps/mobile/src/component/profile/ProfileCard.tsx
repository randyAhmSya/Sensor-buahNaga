import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/component/ui/Card";
import type { UserProfile } from "@/constant/profile";

interface ProfileCardProps {
  user: UserProfile;
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <View className="mx-4 mt-4">
      <Card className="p-5 border border-slate-200 bg-white">
        <View className="flex-row items-center gap-3.5">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200">
            <Ionicons name="person-outline" size={24} color="#059669" />
          </View>

          <View className="flex-1" style={{ flexShrink: 1 }}>
            <Text className="text-lg font-bold text-slate-900" numberOfLines={1}>
              {user.name}
            </Text>
            {user.email ? (
              <Text className="text-xs font-medium text-slate-600 mt-0.5" numberOfLines={1}>
                {user.email}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="mt-3.5 flex-row items-center justify-between">
          <View className="rounded-full px-3 py-1 bg-emerald-50 border border-emerald-300">
            <Text className="text-xs font-bold text-emerald-800">
              {user.role}
            </Text>
          </View>
        </View>

        <View className="mt-3.5 pt-3 border-t border-slate-200 flex-row items-center gap-1.5">
          <Ionicons name="location-outline" size={14} color="#059669" />
          <Text className="text-xs font-medium text-slate-600" numberOfLines={1}>
            {user.location}
          </Text>
        </View>
      </Card>
    </View>
  );
}
