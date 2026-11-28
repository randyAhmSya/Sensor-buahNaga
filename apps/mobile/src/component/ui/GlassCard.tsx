import React from "react";
import { View, type ViewProps } from "react-native";
import { colors, radius } from "@/theme/tokens";

/**
 * Kartu "kaca": latar putih semi-transparan, garis tepi putih halus, sudut besar,
 * dan bayangan lembut kehijauan. Semua warna dari theme/tokens.ts.
 */
export const GLASS = {
  background: colors.glass.background,
  border: colors.glass.border,
  shadow: colors.glass.shadow,
  radius: radius.glass,
} as const;

export function GlassCard({ style, children, ...rest }: ViewProps) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: GLASS.background,
          borderRadius: GLASS.radius,
          borderWidth: 1,
          borderColor: GLASS.border,
          boxShadow: GLASS.shadow,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
