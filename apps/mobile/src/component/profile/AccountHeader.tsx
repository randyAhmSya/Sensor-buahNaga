import React from "react";
import { View, Text, Pressable } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface Props {
  title: string;
}

export function AccountHeader({ title }: Props) {
  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/profile");
    }
  }

  return (
    <View className="flex-row items-center px-4 py-5">
      <Pressable onPress={handleBack} className="w-10">
        <Ionicons name="arrow-back" size={24} color="#14532D" />
      </Pressable>

      <Text className="flex-1 text-center text-lg font-bold text-gray-900">
        {title}
      </Text>

      <View className="w-10" />
    </View>
  );
}
