import React from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Card } from "@/component/ui/Card";

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-6">
      <Card className="items-center p-6">
        <Ionicons name="alert-circle-outline" size={60} color="#DC2626" />

        <Text className="mt-4 text-xl font-bold text-gray-900">
          Halaman Tidak Ditemukan
        </Text>

        <Text className="mt-2 text-center text-sm text-gray-500">
          Node yang kamu cari tidak tersedia
        </Text>

        <Text
          onPress={() => router.back()}
          className="mt-5 font-semibold text-green-700"
        >
          Kembali
        </Text>
      </Card>
    </View>
  );
}
