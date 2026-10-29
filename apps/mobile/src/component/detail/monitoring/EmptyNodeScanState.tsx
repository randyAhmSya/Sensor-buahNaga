import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { PressableOpacity } from "@/component/ui/PressableOpacity";

interface EmptyNodeScanStateProps {
  onScanPress?: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
  isError?: boolean;
}

export function EmptyNodeScanState({
  onScanPress,
  title = "Pindai Node Terlebih Dahulu",
  description = "Silakan pindai QR code pada fisik node sensor terlebih dahulu untuk memantau data telemetri.",
  buttonText = "Pindai Node Sekarang",
  isError = false,
}: EmptyNodeScanStateProps) {
  const handleScan = () => {
    if (onScanPress) {
      onScanPress();
    } else {
      router.push("/scan");
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-6 py-12 bg-gray-50">
      <View
        className={`w-20 h-20 rounded-3xl items-center justify-center mb-5 border ${
          isError
            ? "bg-amber-50 border-amber-200"
            : "bg-emerald-50 border-emerald-100"
        }`}
      >
        <Ionicons
          name={isError ? "alert-circle-outline" : "qr-code-outline"}
          size={44}
          color={isError ? "#D97706" : "#15803d"}
        />
      </View>

      <Text className="text-xl font-bold text-slate-800 text-center tracking-tight">
        {title}
      </Text>

      <Text className="text-sm text-slate-500 text-center mt-2 px-4 leading-relaxed max-w-xs">
        {description}
      </Text>

      <PressableOpacity
        onPress={handleScan}
        activeOpacity={0.85}
        className={`mt-7 flex-row items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl shadow-sm min-h-[48px] ${
          isError ? "bg-amber-600" : "bg-emerald-700"
        }`}
        accessibilityRole="button"
        accessibilityLabel={buttonText}
      >
        <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
        <Text className="text-sm font-semibold text-white">
          {buttonText}
        </Text>
      </PressableOpacity>
    </View>
  );
}
