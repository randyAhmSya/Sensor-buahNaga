import React from "react";
import { ScrollView, View, ActivityIndicator, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useNodeRingkasan } from "@/hooks/useNodeRingkasan";
import { PressableOpacity } from "@/component/ui/PressableOpacity";

import { NodeHeroCard } from "./NodeHeroCard";
import { SensorGrid } from "./SensorGrid";
import { LightingScheduleCard } from "./LightingScheduleCard";
import { DimmingHistoryChartCard } from "./DimmingHistoryChartCard";
import { DeviceInfoCard } from "./DeviceInfoCard";
import { NodeDetailHeader } from "./NodeDetailHeader";
import { EmptyNodeScanState } from "./EmptyNodeScanState";

interface NodeDetailScreenProps {
  nodeId?: string;
}

export function NodeDetailScreen({ nodeId }: NodeDetailScreenProps) {
  const { ringkasan, loading, error, isInvalidIdentifier, refetch } =
    useNodeRingkasan(nodeId);

  // 1. Loading State
  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <NodeDetailHeader nodeId={nodeId || "Memuat..."} />
        <View className="flex-1 items-center justify-center p-8">
          <ActivityIndicator size="large" color="#047857" />
          <Text className="text-xs text-slate-500 mt-3 font-medium">
            Memuat ringkasan data node...
          </Text>
        </View>
      </View>
    );
  }

  // 2. Jika format QR Code tidak sesuai
  if (isInvalidIdentifier) {
    return (
      <View className="flex-1 bg-gray-50">
        <NodeDetailHeader nodeId="QR Code Tidak Sesuai" />
        <EmptyNodeScanState
          title="Format QR Code Tidak Sesuai"
          description="Kode QR yang dipindai bukan ID atau kode serial node yang valid. Silakan gunakan tombol Scan pada menu navigasi bawah untuk memindai ulang."
          isError={true}
        />
      </View>
    );
  }

  // 3. Error Boundary / Retry State jika query API gagal
  if (error && !ringkasan) {
    return (
      <View className="flex-1 bg-gray-50">
        <NodeDetailHeader nodeId={nodeId || "Gagal Memuat"} />
        <View className="flex-1 items-center justify-center p-6">
          <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
          <Text className="text-base font-bold text-slate-800 mt-3 text-center">
            Gagal Memuat Detail Node
          </Text>
          <Text className="text-xs text-slate-500 mt-1 text-center max-w-xs leading-relaxed">
            {error}
          </Text>
          <PressableOpacity
            onPress={refetch}
            activeOpacity={0.8}
            className="mt-6 px-6 py-2.5 bg-emerald-700 rounded-xl"
          >
            <Text className="text-sm font-semibold text-white">Coba Lagi</Text>
          </PressableOpacity>
        </View>
      </View>
    );
  }

  // 4. Jika belum ada aksi scan (nodeId tidak ada atau kosong)
  if (!nodeId || !nodeId.trim()) {
    return (
      <View className="flex-1 bg-gray-50">
        <NodeDetailHeader nodeId="Belum Dipindai" />
        <EmptyNodeScanState
          title="Belum Ada Node yang Dipindai"
          description="Silakan gunakan tombol Scan pada menu navigasi bawah untuk memindai QR code pada fisik node sensor."
        />
      </View>
    );
  }

  // 5. Jika nodeId ada namun tidak ditemukan di backend
  if (!ringkasan) {
    return (
      <View className="flex-1 bg-gray-50">
        <NodeDetailHeader nodeId={nodeId} />
        <EmptyNodeScanState
          title="Node Tidak Ditemukan"
          description={`Data node dengan ID "${nodeId}" tidak ditemukan di sistem atau Anda tidak memiliki akses ke kebun terkait. Gunakan tombol Scan pada menu navigasi bawah untuk memindai node lain.`}
        />
      </View>
    );
  }

  // 6. Data Riil Berhasil Dimuat dari Endpoint Tunggal Ringkasan
  const nodeInfo = ringkasan.node;

  return (
    <View className="flex-1 bg-gray-50">
      <NodeDetailHeader nodeId={nodeInfo.kode_perangkat || nodeInfo.id_sensor} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}
      >
        {/* Header Kartu: Kode Perangkat, Kebun-Blok, Satu Status Badge Solid, Waktu Aktif */}
        <NodeHeroCard node={nodeInfo} />

        {/* Grid 4 Metrik: Cahaya, Suhu, Energi, Dimming */}
        <View className="mt-4">
          <SensorGrid
            bacaan={ringkasan.bacaan_terakhir}
            energi={ringkasan.energi}
            dimming={ringkasan.dimming_terakhir}
          />
        </View>

        {/* Mode Lampu: Mode, Jam Nyala, Asal Jadwal, Parameter, Jendela Nyala */}
        <View className="mt-4">
          <LightingScheduleCard
            sensorId={nodeInfo.id_sensor}
            jadwalInfo={ringkasan.jadwal}
            onRefresh={refetch}
          />
        </View>

        {/* Grafik Riwayat Auto-Dimming: Dimuat Setelah Ringkasan Selesai */}
        <View className="mt-4">
          <DimmingHistoryChartCard
            sensorId={nodeInfo.id_sensor}
            enabled={Boolean(ringkasan)}
          />
        </View>

        {/* Info Perangkat Fisik (Collapsible di Bagian Bawah) */}
        <View className="mt-4">
          <DeviceInfoCard node={nodeInfo} />
        </View>
      </ScrollView>
    </View>
  );
}
