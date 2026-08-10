import React from "react";
import { ScrollView, Text, View, Pressable } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const notifications = [
  {
    title: "Suhu Kritis / Peringatan Panas",
    desc: "Kirim alert jika suhu kebun melebihi batas aman.",
    active: true,
  },
  {
    title: "Perangkat Node Offline",
    desc: "Kirim alert jika hardware ESP32 terputus dari internet.",
    active: true,
  },
  {
    title: "Perubahan Mode Auto-Dimming",
    desc: "Notifikasi saat sistem lampu beralih ke kontrol manual.",
    active: false,
  },
  {
    title: "Ringkasan Estimasi Panen",
    desc: "Pengingat mingguan mendekati tanggal panen.",
    active: true,
  },
];

export default function NotificationPage() {
  return (
    <ScrollView className="flex-1 bg-gray-50 px-4">
      <View className="flex-row items-center py-5">
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#14532d" />
        </Pressable>

        <Text className="flex-1 text-center text-lg font-bold text-gray-900">
          Pengaturan Notifikasi
        </Text>

        <View className="w-6" />
      </View>

      <Text className="mb-4 text-sm font-bold text-green-800">
        PEMBERITAHUAN SISTEM & PERANGKAT
      </Text>

      <View className="rounded-2xl bg-white p-4">
        {notifications.map((item, index) => (
          <View
            key={item.title}
            className={`flex-row items-center justify-between py-4 ${
              index !== notifications.length - 1
                ? "border-b border-gray-200"
                : ""
            }`}
          >
            <View className="flex-1 pr-3">
              <Text className="font-bold text-gray-900">{item.title}</Text>

              <Text className="mt-1 text-sm text-gray-500">{item.desc}</Text>
            </View>

            <View
              className={`h-7 w-12 rounded-full justify-center ${
                item.active ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <View
                className={`h-6 w-6 rounded-full bg-white ${
                  item.active ? "ml-5" : "ml-1"
                }`}
              />
            </View>
          </View>
        ))}
      </View>

      <View className="mt-6 h-32 items-center justify-center rounded-2xl bg-white">
        <Ionicons name="notifications-outline" size={35} color="#d1d5db" />
      </View>
    </ScrollView>
  );
}
