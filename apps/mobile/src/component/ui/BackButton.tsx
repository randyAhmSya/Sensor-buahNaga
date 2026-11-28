import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/theme/tokens";

interface BackButtonProps {
  /** Tujuan bila tidak ada halaman sebelumnya (mis. dibuka lewat deep link). */
  fallback?: string;
  /** Ganti perilaku bawaan (router.back) bila perlu. */
  onPress?: () => void;
}

/** Satu-satunya tombol kembali di aplikasi: bulat, abu-abu muda, ikon panah. */
export function BackButton({ fallback = "/(tabs)", onPress }: BackButtonProps) {
  const handle = () => {
    if (onPress) return onPress();
    if (router.canGoBack()) router.back();
    else router.replace(fallback as never);
  };

  return (
    <Pressable
      onPress={handle}
      accessibilityRole="button"
      accessibilityLabel="Kembali"
      hitSlop={8}
      className="h-10 w-10 items-center justify-center rounded-full"
      style={({ pressed }) => ({
        backgroundColor: pressed
          ? colors.backButton.pressedBg
          : colors.backButton.bg,
      })}
    >
      <Ionicons name="arrow-back" size={22} color={colors.backButton.icon} />
    </Pressable>
  );
}
