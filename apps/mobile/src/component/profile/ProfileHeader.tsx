import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TAB_COLORS } from "@/constant/Tabs";
import { PressableOpacity } from "@/component/ui/PressableOpacity";

interface ProfileHeaderProps {
  onSettingsPress?: () => void;
}

export function ProfileHeader({ onSettingsPress }: ProfileHeaderProps) {
  return (
    <View className="items-center justify-center relative px-4 py-5">
      <Text className="text-xl font-bold" style={{ color: TAB_COLORS.active }}>
        Profil Pengguna
      </Text>

      <PressableOpacity onPress={onSettingsPress} className="absolute right-4">
        <Ionicons name="settings-outline" size={28} color="#374151" />
      </PressableOpacity>
    </View>
  );
}
