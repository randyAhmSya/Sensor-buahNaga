import React from "react";
import { Image, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/component/ui/Card";
import { TAB_COLORS } from "@/constant/Tabs";
import type { UserProfile } from "@/constant/profile";

interface ProfileCardProps {
  user: UserProfile;
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <View className="mx-4 mt-8">
      <Card className="items-center p-6 pt-14">
        <Image
          source={{ uri: user.avatarUrl }}
          className="absolute -top-10 h-30 w-30 rounded-full"
        />

        <Text className="text-xl font-bold text-gray-900 pt-10">
          {user.name}
        </Text>

        <View className="flex-row items-center gap-1 mt-2">
          <Text className="text-sm text-gray-500">{user.role}</Text>

          <Ionicons
            name="checkmark-circle"
            size={14}
            color={TAB_COLORS.active}
          />
        </View>

        <View className="flex-row items-center gap-1 mt-2">
          <Ionicons name="location-outline" size={12} color="#9CA3AF" />

          <Text className="text-xs text-gray-400">{user.location}</Text>
        </View>
      </Card>
    </View>
  );
}
