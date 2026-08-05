import { TAB_COLORS } from "@/constant/Tabs";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { PressableOpacity } from "../ui/PressableOpacity";

interface DashboardHeaderProps {
  appName: string;
  onNotificationPress?: () => void;
  tone?: "dark" | "light";
}

export function DashboardHeader({
  appName,
  onNotificationPress,
  tone = "dark",
}: DashboardHeaderProps) {
  const isLight = tone === "light";

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-2">
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{
            backgroundColor: isLight ? "rgba(255,255,255,0.25)" : "#DCFCE7",
          }}
        >
          <Ionicons
            name="person"
            size={18}
            color={isLight ? "#FFFFFF" : TAB_COLORS.active}
          />
        </View>
        <Text
          className="text-lg font-bold"
          style={{ color: isLight ? "#FFFFFF" : TAB_COLORS.active }}
        >
          {appName}
        </Text>
      </View>
      <PressableOpacity
        onPress={onNotificationPress}
        className="h-10 w-10 items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel="Notifikasi"
      >
        <Ionicons
          name="notifications"
          size={22}
          color={isLight ? "#FFFFFF" : "#1F2937"}
        />
      </PressableOpacity>
    </View>
  );
}
