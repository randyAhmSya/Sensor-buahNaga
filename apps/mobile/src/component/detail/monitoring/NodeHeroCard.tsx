import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/component/ui/Card";
import { StatusBadge } from "@/component/ui/StatusBadge";
import type { NodeRingkasanNodeInfo } from "@/types/api/nodeRingkasan.dto";
import type { BadgeTone } from "@/theme/tokens";
import { formatWaktuRelatif } from "@/utils/date";

interface Props {
  node: NodeRingkasanNodeInfo;
}

export function NodeHeroCard({ node }: Props) {
  let tone: BadgeTone = "neutral";
  let statusLabel = "Belum Terlihat";

  if (node.status === "online") {
    tone = "success";
    statusLabel = "Online";
  } else if (node.status === "offline") {
    tone = "danger";
    statusLabel = "Offline";
  } else {
    tone = "neutral";
    statusLabel = "Belum Pernah Terlihat";
  }

  const locationText = `${node.kebun?.nama_kebun || "Kebun"} - ${node.blok?.nama_blok || "Blok"}`;
  const waktuAktifText = node.terakhir_terlihat
    ? `Terakhir aktif: ${formatWaktuRelatif(node.terakhir_terlihat)}`
    : "Belum pernah mengirim data";

  return (
    <Card className="mt-4 border border-slate-200 bg-white p-4">
      {/* Baris 1: Kode Perangkat & Satu Badge Status Solid */}
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-row items-center gap-2.5 flex-1 mr-2" style={{ flexShrink: 1 }}>
          <View className="h-10 w-10 items-center justify-center rounded-lg bg-white border-[1.5px] border-slate-400">
            <Ionicons name="hardware-chip-outline" size={20} color="#334155" />
          </View>

          <View className="flex-1" style={{ flexShrink: 1 }}>
            <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
              {node.kode_perangkat || node.id_sensor}
            </Text>
            <Text className="text-xs text-slate-600 mt-0.5" numberOfLines={1}>
              {locationText}
            </Text>
          </View>
        </View>

        <StatusBadge tone={tone} label={statusLabel} size="sm" />
      </View>

      {/* Baris 2: Satu Keterangan Waktu Aktif Tunggal (Bebas Duplikasi Label) */}
      <View className="mt-3 pt-3 border-t border-slate-200 flex-row items-center gap-1.5">
        <Ionicons name="time-outline" size={14} color="#64748B" />
        <Text className="text-xs font-medium text-slate-600">
          {waktuAktifText}
        </Text>
      </View>
    </Card>
  );
}
