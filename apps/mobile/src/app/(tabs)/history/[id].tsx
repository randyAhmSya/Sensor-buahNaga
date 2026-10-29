import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQrScanLogs } from "@/hooks/useQrScanLogs";
import { ActivityCard } from "@/component/dashboard/ActivityCard";

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { logs } = useQrScanLogs();

  const nodeLogs = useMemo(() => {
    if (!id) return logs;
    const lowerId = id.toLowerCase();
    return logs.filter(
      (l) =>
        (l.kode_perangkat && l.kode_perangkat.toLowerCase() === lowerId) ||
        (l.teks_kode_qr && l.teks_kode_qr.toLowerCase() === lowerId) ||
        (l.kode_qr?.node_sensor?.id_sensor &&
          l.kode_qr.node_sensor.id_sensor.toLowerCase() === lowerId),
    );
  }, [logs, id]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3.5">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
          >
            <Ionicons name="arrow-back" size={22} color="#15803d" />
          </Pressable>

          <Text className="text-base font-bold text-gray-900">
            Riwayat Node / Sensor
          </Text>

          <View className="h-10 w-10" />
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1 px-4 py-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Card Info Node */}
          <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                <Ionicons name="time-outline" size={26} color="#15803d" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ID Perangkat / Node
                </Text>
                <Text className="text-lg font-bold text-gray-900">
                  {id || "Node Tidak Diketahui"}
                </Text>
              </View>
            </View>

            <View className="mt-4 border-t border-gray-100 pt-3">
              <Text className="text-sm text-gray-600 leading-relaxed">
                Log telemetri historis (pencahayaan lux, konsumsi daya watt, dan pembacaan suhu) untuk node ini akan dimuat di sini.
              </Text>
            </View>
          </View>

          {/* Log list pemindaian untuk node ini */}
          <View className="mt-6">
            <Text className="text-sm font-bold text-gray-900 mb-2">
              Riwayat Aktivitas Pemindaian Node
            </Text>
            {nodeLogs.length === 0 ? (
              <View className="items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-6">
                <Ionicons name="document-text-outline" size={36} color="#9ca3af" />
                <Text className="mt-2 text-center text-sm font-medium text-gray-600">
                  Belum ada log pemindaian untuk node ini
                </Text>
                <Text className="mt-1 text-center text-xs text-gray-400">
                  Data pemindaian akan tercatat otomatis saat QR node dipindai.
                </Text>
              </View>
            ) : (
              nodeLogs.map((log) => (
                <ActivityCard key={log.id_scan_log} log={log} />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
