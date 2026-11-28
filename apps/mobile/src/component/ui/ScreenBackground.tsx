import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/theme/tokens";

/** Latar layar: gradasi hijau muda lembut ke abu-abu terang, tempat kartu kaca melayang. */
export function ScreenBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.screen.base }}>
      <LinearGradient
        pointerEvents="none"
        colors={[...colors.screen.gradient]}
        locations={[...colors.screen.gradientLocations]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}
