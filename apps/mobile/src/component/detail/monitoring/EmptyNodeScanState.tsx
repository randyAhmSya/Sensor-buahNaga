import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyNodeScanStateProps {
  title?: string;
  description?: string;
  isError?: boolean;
}

export function EmptyNodeScanState({
  title = "Belum Ada Node Terhubung",
  description = "Silakan gunakan tombol Scan di menu navigasi bawah untuk menghubungkan fisik node sensor ke sistem pemantauan kebun.",
  isError = false,
}: EmptyNodeScanStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <View
        className={`w-20 h-20 rounded-lg items-center justify-center mb-5 bg-white border-[1.5px] ${
          isError ? "border-amber-500" : "border-slate-400"
        }`}
      >
        <Ionicons
          name={isError ? "alert-circle-outline" : "hardware-chip-outline"}
          size={40}
          color={isError ? "#D97706" : "#475569"}
        />
      </View>

      <Text className="text-xl font-bold text-slate-800 text-center tracking-tight">
        {title}
      </Text>

      <Text className="text-sm text-slate-500 text-center mt-2 px-4 leading-relaxed max-w-xs">
        {description}
      </Text>
    </View>
  );
}
