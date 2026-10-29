import React, { memo, useCallback } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TAB_COLORS } from "@/constant/Tabs";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import { useQrScanLogs } from "@/hooks/useQrScanLogs";
import type { QrScanLogItem } from "@/service/qrScanService";
import type { ActivityItem } from "@/constant/dashboard";
import { ActivityCard } from "./ActivityCard";

interface ActivityListProps {
  activities?: ActivityItem[];
  onSeeAllPress?: () => void;
  onItemPress?: (id: string) => void;
}

export const ActivityList = memo(function ActivityList({
  onSeeAllPress,
  onItemPress,
}: ActivityListProps) {
  const { logs, isPending } = useQrScanLogs();

  const handleSeeAll = useCallback(() => {
    if (onSeeAllPress) {
      onSeeAllPress();
    } else {
      router.push("/activity");
    }
  }, [onSeeAllPress]);

  const handlePress = useCallback(
    (log: QrScanLogItem) => {
      if (onItemPress) {
        onItemPress(log.id_scan_log);
        return;
      }

      // Jika berhasil, arahkan ke detail node
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
    },
    [onItemPress],
  );

  return (
    <View className="pt-1 mb-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="document-text-outline" size={20} color="#059669" />
          <Text className="text-lg font-bold text-slate-900">
            Aktivitas Pemindaian QR
          </Text>
        </View>

        <PressableOpacity onPress={handleSeeAll} hitSlop={8}>
          <Text
            className="text-sm font-semibold"
            style={{ color: TAB_COLORS.active }}
          >
            Lihat Semua
          </Text>
        </PressableOpacity>
      </View>

      {isPending ? (
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="small" color="#059669" />
          <Text className="mt-2 text-xs text-slate-600">
            Memuat riwayat pemindaian...
          </Text>
        </View>
      ) : logs.length === 0 ? (
        <View className="items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 my-2">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-emerald-50 mb-2">
            <Ionicons name="qr-code-outline" size={24} color="#059669" />
          </View>
          <Text className="text-center text-sm font-bold text-slate-900">
            Belum Ada Riwayat Pemindaian
          </Text>
          <Text className="mt-1 text-center text-xs text-slate-600 max-w-xs">
            Setiap aktivitas scan QR node sensor akan tercatat secara otomatis di sini.
          </Text>
          <PressableOpacity
            onPress={() => router.push("/scan")}
            className="mt-4 flex-row items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2"
          >
            <Ionicons name="scan-outline" size={14} color="#ffffff" />
            <Text className="text-xs font-bold text-white">
              Pindai QR Node Sekarang
            </Text>
          </PressableOpacity>
        </View>
      ) : (
        logs.slice(0, 6).map((log) => (
          <ActivityCard
            key={log.id_scan_log}
            log={log}
            onPress={() => handlePress(log)}
          />
        ))
      )}
    </View>
  );
});
