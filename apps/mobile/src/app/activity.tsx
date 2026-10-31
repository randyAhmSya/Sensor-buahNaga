import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  TextInput,
} from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQrScanLogs } from "@/hooks/useQrScanLogs";
import { ActivityCard } from "@/component/dashboard/ActivityCard";
import { AsyncStateView } from "@/component/ui/AsyncStateView";
import { Card } from "@/component/ui/Card";
import type { QrScanLogItem } from "@/service/qrScanService";

type FilterStatus = "all" | "success" | "failed";

export default function ActivityScreen() {
  const { logs, isPending, isError, error, refetch } = useQrScanLogs();

  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filteredLogs = useMemo(() => {
    let result = logs;

    // Filter status
    if (filterStatus === "success") {
      result = result.filter(
        (l) => l.status_scan === "berhasil" || l.status_scan === "sukses",
      );
    } else if (filterStatus === "failed") {
      result = result.filter(
        (l) => l.status_scan !== "berhasil" && l.status_scan !== "sukses",
      );
    }

    // Search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (l) =>
          (l.teks_kode_qr && l.teks_kode_qr.toLowerCase().includes(q)) ||
          (l.kode_perangkat && l.kode_perangkat.toLowerCase().includes(q)) ||
          (l.platform && l.platform.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [logs, filterStatus, searchQuery]);

  const handleCardPress = useCallback((log: QrScanLogItem) => {
    const targetId =
      log.kode_qr?.node_sensor?.id_sensor ||
      log.kode_perangkat ||
      log.teks_kode_qr;

    if (
      targetId &&
      (log.status_scan === "berhasil" || log.status_scan === "sukses")
    ) {
      router.push({
        pathname: "/monitoring/[id]",
        params: { id: targetId },
      });
    }
  }, []);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-gray-50" style={{ flex: 1 }} edges={["top", "left", "right"]}>
        {/* Header */}
        <View className="border-b border-gray-100 bg-white px-4 py-3.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <Pressable
                onPress={() => router.back()}
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
                accessibilityRole="button"
                accessibilityLabel="Kembali"
              >
                <Ionicons name="arrow-back" size={22} color="#1F2937" />
              </Pressable>

              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900">
                  Riwayat Aktivitas Pemindaian
                </Text>
                <Text className="text-xs text-gray-500">
                  {logs.length} catatan aktivitas pemindaian QR
                </Text>
              </View>
            </View>
          </View>

          {/* Search Bar */}
          <Card className="mt-3 flex-row items-center gap-2 px-3 py-2 bg-white border-[1.5px] border-slate-400">
            <Ionicons name="search" size={16} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari teks QR atau kode node..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-sm text-gray-800 py-0"
            />
            {searchQuery !== "" && (
              <Pressable onPress={() => setSearchQuery("")} className="p-1">
                <Ionicons name="close-circle" size={16} color="#9CA3AF" />
              </Pressable>
            )}
          </Card>

          {/* Filter Status Chips */}
          <View className="mt-3 flex-row items-center gap-2">
            <Pressable
              onPress={() => setFilterStatus("all")}
              className={`rounded-full px-3.5 py-1.5 border-[1.5px] ${
                filterStatus === "all"
                  ? "bg-[#047857] border-[#047857]"
                  : "bg-white border-slate-400"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  filterStatus === "all" ? "text-white" : "text-slate-700"
                }`}
              >
                Semua ({logs.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setFilterStatus("success")}
              className={`rounded-full px-3.5 py-1.5 border-[1.5px] ${
                filterStatus === "success"
                  ? "bg-[#047857] border-[#047857]"
                  : "bg-white border-slate-400"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  filterStatus === "success" ? "text-white" : "text-slate-700"
                }`}
              >
                Berhasil (
                {
                  logs.filter(
                    (l) =>
                      l.status_scan === "berhasil" ||
                      l.status_scan === "sukses",
                  ).length
                }
                )
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setFilterStatus("failed")}
              className={`rounded-full px-3.5 py-1.5 border-[1.5px] ${
                filterStatus === "failed"
                  ? "bg-[#047857] border-[#047857]"
                  : "bg-white border-slate-400"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  filterStatus === "failed" ? "text-white" : "text-slate-700"
                }`}
              >
                Gagal (
                {
                  logs.filter(
                    (l) =>
                      l.status_scan !== "berhasil" &&
                      l.status_scan !== "sukses",
                  ).length
                }
                )
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Content */}
        {isPending ? (
          <AsyncStateView status="loading" />
        ) : isError ? (
          <AsyncStateView
            status="error"
            errorMessage={error?.message || "Gagal memuat log aktivitas"}
            onRetry={refetch}
          />
        ) : filteredLogs.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <View className="h-16 w-16 items-center justify-center rounded-lg bg-white border-[1.5px] border-slate-400 mb-3">
              <Ionicons name="document-text-outline" size={32} color="#047857" />
            </View>
            <Text className="text-base font-bold text-gray-900 text-center">
              Tidak Ada Catatan Aktivitas
            </Text>
            <Text className="mt-1 text-xs text-gray-500 text-center max-w-xs">
              {searchQuery || filterStatus !== "all"
                ? "Tidak ada data riwayat yang cocok dengan filter atau pencarian Anda."
                : "Semua data scan QR fisik node sensor akan otomatis terekam di layar ini. Gunakan tombol Scan pada menu navigasi bawah untuk mulai memindai."}
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-4 pt-3"
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredLogs.map((log) => (
              <ActivityCard
                key={log.id_scan_log}
                log={log}
                onPress={() => handleCardPress(log)}
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}
