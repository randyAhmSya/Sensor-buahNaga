import React, { useState } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/component/ui/Card";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import type { NodeRingkasanNodeInfo } from "@/types/api/nodeRingkasan.dto";
import { colors, border } from "@/theme/tokens";
import { formatWattTerpasang } from "@/utils/watt";

interface Props {
  node: NodeRingkasanNodeInfo;
}

export function DeviceInfoCard({ node }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const qrText =
    typeof node.kode_qr === "object" && node.kode_qr !== null
      ? node.kode_qr.kode_qr || "-"
      : node.kode_qr || "-";

  const gatewayText = node.gateway?.kode_perangkat || "Tidak terhubung gateway";
  const blokLuasText = `${node.blok.nama_blok} (${
    node.blok.luas_area ? `${node.blok.luas_area} m²` : "Luas belum diatur"
  })`;

  const jumlahLampuText = `${node.jumlah_lampu ?? 1} lampu`;
  const dayaTerpasangText = formatWattTerpasang(node.watt_terpasang);

  return (
    <Card className="border border-slate-200 bg-white p-4">
      {/* Header Info Perangkat (Dapat Ditekan untuk Lipat/Buka) */}
      <PressableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-2">
          <View
            className="h-9 w-9 items-center justify-center rounded-lg bg-white"
            style={{
              borderWidth: border.strong,
              borderColor: colors.border.neutral,
            }}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.icon.neutral}
            />
          </View>
          <View>
            <Text className="text-sm font-bold text-slate-900">
              Informasi Perangkat
            </Text>
            <Text className="text-xs text-slate-500">
              {isExpanded ? "Sembunyikan detail fisik node" : "Ketuk untuk melihat detail fisik node"}
            </Text>
          </View>
        </View>

        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.icon.subtle}
        />
      </PressableOpacity>

      {/* Konten Detail saat Terbuka */}
      {isExpanded && (
        <View className="mt-3.5 pt-3.5 border-t border-slate-200 gap-3">
          {/* Tipe Sensor */}
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-medium text-slate-600">Tipe Sensor</Text>
            <Text className="text-xs font-bold text-slate-900">
              {node.tipe_sensor || "Sensor Buah Naga"}
            </Text>
          </View>

          {/* Jumlah Lampu Dikendalikan */}
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-medium text-slate-600">Jumlah Lampu</Text>
            <Text className="text-xs font-bold text-slate-900">
              {jumlahLampuText}
            </Text>
          </View>

          {/* Daya Terpasang */}
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-medium text-slate-600">Daya Terpasang</Text>
            <Text className="text-xs font-bold text-slate-900">
              {dayaTerpasangText}
            </Text>
          </View>

          {/* Kode Gateway */}
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-medium text-slate-600">Gateway IoT</Text>
            <Text className="text-xs font-bold text-slate-900">{gatewayText}</Text>
          </View>

          {/* Teks QR Code */}
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-medium text-slate-600">Kode QR Fisik</Text>
            <Text className="text-xs font-bold text-slate-900" numberOfLines={1}>
              {qrText}
            </Text>
          </View>

          {/* Blok & Luas Area */}
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-medium text-slate-600">Blok Lahan & Luas</Text>
            <Text className="text-xs font-bold text-slate-900">{blokLuasText}</Text>
          </View>
        </View>
      )}
    </Card>
  );
}
