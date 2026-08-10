import React from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LabeledInputProps extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export function LabeledInput({
  label,
  icon,
  ...inputProps
}: LabeledInputProps) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-xs text-gray-500">{label}</Text>
      <View className="flex-row items-center gap-2 rounded-xl bg-gray-50 px-3 py-3">
        <Ionicons name={icon} size={16} color="#9CA3AF" />
        <TextInput
          className="flex-1 text-sm text-gray-800"
          placeholderTextColor="#9CA3AF"
          {...inputProps}
        />
      </View>
    </View>
  );
}
