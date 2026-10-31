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
        <View
          key="activity-empty-container"
          className="items-center justify-center rounded-lg bg-white p-6 my-2"
          style={{ borderStyle: "dashed", borderWidth: 1, borderColor: "#CBD5E1" }}
        >
          <View className="h-12 w-12 items-center justify-center rounded-lg bg-white border-[1.5px] border-slate-400 mb-2">
            <Ionicons name="qr-code-outline" size={24} color="#047857" />
          </View>
          <Text className="text-center text-sm font-bold text-slate-900">
            Belum Ada Riwayat Pemindaian
          </Text>
          <Text className="mt-1 text-center text-xs text-slate-600 max-w-xs">
            Setiap aktivitas scan QR node sensor akan tercatat secara otomatis di sini. Gunakan tombol Scan pada menu navigasi bawah untuk mulai memindai.
          </Text>
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
