import React from "react";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PressableOpacity } from "@/component/ui/PressableOpacity";

interface LogoutButtonProps {
  onPress?: () => void;
}

export function LogoutButton({ onPress }: LogoutButtonProps) {
  return (
    <PressableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="mx-4 mt-6 flex-row items-center justify-center gap-2 rounded-lg border border-rose-300 bg-white py-3.5"
    >
      <Ionicons name="log-out-outline" size={18} color="#DC2626" />
      <Text className="text-sm font-bold text-rose-700">
        Keluar Akun (Log Out)
      </Text>
    </PressableOpacity>
  );
}
