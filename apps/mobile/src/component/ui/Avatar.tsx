import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { radius } from "@/theme/tokens";

export interface AvatarProps {
  name?: string;
  uri?: string | null;
  size?: number;
  className?: string;
}

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return "P";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export const Avatar = memo(function Avatar({
  name = "Petani",
  uri,
  size = 80,
  className = "",
}: AvatarProps) {
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.35);

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: radius.full,
    backgroundColor: "#047857",
    borderColor: "#065F46",
    borderWidth: 2,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    overflow: "hidden" as const,
  };

  if (uri && uri.trim() !== "") {
    return (
      <View style={containerStyle} className={className}>
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          accessibilityLabel={`Foto profil ${name}`}
        />
      </View>
    );
  }

  return (
    <View style={containerStyle} className={className}>
      <Text
        style={{
          color: "#FFFFFF",
          fontSize,
          fontWeight: "700",
          letterSpacing: 0.5,
        }}
      >
        {initials}
      </Text>
    </View>
  );
});
