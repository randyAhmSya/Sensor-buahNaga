import React from "react";
import { ScrollView, View, ActivityIndicator, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useNodeDetail } from "@/hooks/useNodeDetails";
import { PressableOpacity } from "@/component/ui/PressableOpacity";

import { NodeHeroCard } from "./NodeHeroCard";
import { SensorGrid } from "./SensorGrid";
import { ConnectionCard } from "./ConnectionCard";
import { LightingScheduleCard } from "./LightingScheduleCard";
import { HarvestPredictionCard } from "./HarvestPredictionCard";
import { NodeDetailHeader } from "./NodeDetailHeader";
import { EmptyNodeScanState } from "./EmptyNodeScanState";

interface NodeDetailScreenProps {
  nodeId?: string;
}

export function NodeDetailScreen({ nodeId }: NodeDetailScreenProps) {
  const { node, loading, error, isInvalidUuid, refetch } =
    useNodeDetail(nodeId);

  // 1. Loading State
  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <NodeDetailHeader nodeId={nodeId || "Memuat..."} />
        <View className="flex-1 items-center justify-center p-8">
          <ActivityIndicator size="large" color="#15803d" />
          <Text className="text-xs text-slate-400 mt-3 font-medium">
            Memuat data telemetri node...
          </Text>
        </View>
      </View>
    );
  }

  // 2. Jika format QR Code tidak sesuai
  if (isInvalidUuid) {
    return (
      <View className="flex-1 bg-gray-50">
        <NodeDetailHeader nodeId="QR Code Tidak Sesuai" />
        <EmptyNodeScanState
          title="Format QR Code Tidak Sesuai"
          description="Kode QR yang dipindai bukan ID atau kode serial node yang valid. Silakan pindai ulang QR Code pada fisik node."
          buttonText="Pindai Ulang QR Code"
          isError={true}
        />
      </View>
    );
  }

  // 3. Error Boundary / Retry State jika query API gagal
  if (error && !node) {
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
          description="Silakan pindai QR code pada fisik node sensor terlebih dahulu untuk memantau data telemetri."
          buttonText="Pindai QR Node"
        />
      </View>
    );
  }

  // 5. Jika nodeId ada namun tidak ditemukan di backend
  if (!node) {
    return (
      <View className="flex-1 bg-gray-50">
        <NodeDetailHeader nodeId={nodeId} />
        <EmptyNodeScanState
          title="Node Tidak Ditemukan"
          description={`Data node dengan ID "${nodeId}" tidak ditemukan di sistem atau Anda tidak memiliki akses ke kebun terkait.`}
          buttonText="Pindai Node Lain"
        />
      </View>
    );
  }

  // 6. Data Riil Berhasil Dimuat
  return (
    <View className="flex-1 bg-gray-50">
      <NodeDetailHeader nodeId={node.name || node.id} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 pb-28"
      >
        <NodeHeroCard node={node} />

        <View className="mt-5">
          <SensorGrid sensor={node.sensor} />
        </View>

        <View className="mt-5">
          <ConnectionCard connection={node.connection} />
        </View>

        <View className="mt-5">
          <LightingScheduleCard
            schedule={node.schedule}
            sensorId={node.sensorId || node.id}
          />
        </View>

        <View className="mt-5">
          <HarvestPredictionCard harvest={node.harvest} />
        </View>
      </ScrollView>
    </View>
  );
}
