import React from "react";
import { View, Text } from "react-native";
import { BackButton } from "@/component/ui/BackButton";

interface Props {
  title: string;
}

export function AccountHeader({ title }: Props) {
  return (
    <View className="flex-row items-center px-4 py-5">
      <BackButton fallback="/profile" />

      <Text className="flex-1 text-center text-lg font-bold text-gray-900">
        {title}
      </Text>

      <View className="w-10" />
    </View>
  );
}
