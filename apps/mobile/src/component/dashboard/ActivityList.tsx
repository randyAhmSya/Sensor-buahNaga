import React, { memo, useCallback, useRef } from "react";
import { Text, View, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import { TAB_COLORS } from "@/constant/Tabs";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import { useQrScanLogs } from "@/hooks/useQrScanLogs";
import type { QrScanLogItem } from "@/service/qrScanService";
import { fetchNodeDetail } from "@/service/nodeDetailService";
import { scanHistoryStorage } from "@/service/storage/scanHistoryStorage";
import { isUuid } from "@/hooks/useNodeDetails";
import type { EnhancedApiError } from "@/service/apiClient";
import { ActivityCard } from "./ActivityCard";
import { colors, border } from "@/theme/tokens";

interface ActivityListProps {
  onSeeAllPress?: () => void;
  onItemPress?: (id: string) => void;
}

export const ActivityList = memo(function ActivityList({
  onSeeAllPress,
  onItemPress,
}: ActivityListProps) {
  const { logs, isPending } = useQrScanLogs();
  const isResolvingRef = useRef(false);

  const handleSeeAll = useCallback(() => {
    if (onSeeAllPress) {
      onSeeAllPress();
    } else {
      router.push("/activity");
    }
  }, [onSeeAllPress]);

  const handlePress = useCallback(
    async (log: QrScanLogItem) => {
      if (onItemPress) {
        onItemPress(log.id_scan_log);
        return;
      }

      if (isResolvingRef.current) {
        return;
      }

      // 1. Cek apakah status pemindaian berhasil
      const isSuccess =
        log.status_scan === "berhasil" || log.status_scan === "sukses";
      if (!isSuccess) {
        Alert.alert(
          "Pemindaian Tidak Berhasil",
          "Riwayat pemindaian ini berstatus gagal dan tidak memiliki data node sensor terkait.",
        );
        return;
      }

      // 2. Jika sudah memiliki UUID id_sensor valid, langsung buka rute monitoring
      const existingSensorId = log.kode_qr?.node_sensor?.id_sensor;
      if (existingSensorId && isUuid(existingSensorId)) {
        router.push({
          pathname: "/monitoring/[id]",
          params: { id: existingSensorId },
        });
        return;
      }

      // 3. Tentukan identifier pencarian dari teks QR atau kode perangkat
      const lookupId = log.teks_kode_qr || log.kode_perangkat;
      if (!lookupId) {
        Alert.alert(
          "Node Tidak Ditemukan",
          "Informasi kode QR atau identitas perangkat tidak ditemukan pada riwayat ini.",
        );
        return;
      }

      // 4. Terjemahkan identifier via GET /api/petani/node/{id} (fetchNodeDetail)
      try {
        isResolvingRef.current = true;
        const node = await fetchNodeDetail(lookupId);
        const resolvedSensorId =
          node?.sensorId || (node && isUuid(node.id) ? node.id : undefined);

        if (resolvedSensorId && isUuid(resolvedSensorId)) {
          // Perbarui record di penyimpanan lokal agar tidak perlu diterjemahkan lagi
          if (log.teks_kode_qr) {
            await scanHistoryStorage.updateLogSensorId(
              log.teks_kode_qr,
              resolvedSensorId,
              node?.name,
            );
          }

          router.push({
            pathname: "/monitoring/[id]",
            params: { id: resolvedSensorId },
          });
        } else {
          Alert.alert(
            "Node Tidak Ditemukan",
            "Data node sensor tidak ditemukan atau kode QR belum terpasang ke sensor aktif.",
          );
        }
      } catch (err: unknown) {
        const status =
          (err as EnhancedApiError)?.status ??
          (isAxiosError(err) ? err.response?.status : undefined);

        if (status === 404) {
          Alert.alert(
            "Node Tidak Ditemukan",
            "Data node sensor tidak ditemukan di sistem atau kode QR sudah tidak aktif.",
          );
        } else if (status === 403) {
          Alert.alert(
            "Akses Ditolak",
            "Anda tidak memiliki akses ke data kebun atau sensor terkait.",
          );
        } else {
          Alert.alert(
            "Gagal Terhubung",
            "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
          );
        }
      } finally {
        isResolvingRef.current = false;
      }
    },
    [onItemPress],
  );

  return (
    <View className="pt-1 mb-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="document-text-outline" size={20} color={colors.icon.neutral} />
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
          <ActivityIndicator size="small" color={colors.status.success.bg} />
          <Text className="mt-2 text-xs text-slate-600">
            Memuat riwayat pemindaian...
          </Text>
        </View>
      ) : logs.length === 0 ? (
        <View
          key="activity-empty-container"
          className="items-center justify-center rounded-lg bg-white p-6 my-2"
          style={{
            borderStyle: "dashed",
            borderWidth: border.strong,
            borderColor: colors.border.neutral,
          }}
        >
          <View
            className="h-12 w-12 items-center justify-center rounded-lg bg-white mb-2"
            style={{
              borderWidth: border.strong,
              borderColor: colors.border.neutral,
            }}
          >
            <Ionicons name="qr-code-outline" size={24} color={colors.icon.neutral} />
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
