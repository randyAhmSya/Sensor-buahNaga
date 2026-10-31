import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/component/ui/Card";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  isBasi?: boolean;
  timeLabel?: string | null;
  subInfo?: string | null;
}

export function SensorCard({
  icon,
  label,
  value,
  isBasi = false,
  timeLabel,
  subInfo,
}: Props) {
  // Bila basi true: tampilan lebih redup memakai warna teks netral (bukan opacity pada latar)
  const valueColorClass = isBasi ? "text-slate-500 font-semibold" : "text-slate-900 font-extrabold";

  return (
    <Card className="flex-1 p-3.5 border border-slate-200 bg-white">
      {/* Header Kartu Metrik: Ikon Netral Slate (#334155) & Wadah Border 1.5px Slate-400 */}
      <View className="items-center flex-row gap-2">
        <View className="h-9 w-9 items-center justify-center rounded-lg bg-white border-[1.5px] border-slate-400">
          <Ionicons name={icon} size={20} color="#334155" />
        </View>
        <Text className="text-xs font-bold text-slate-700">{label}</Text>
      </View>

      {/* Nilai Metrik */}
      <Text className={`mt-2.5 text-lg tracking-tight ${valueColorClass}`} numberOfLines={1}>
        {value}
      </Text>

      {/* Keterangan Tambahan / Waktu Data Basi */}
      {timeLabel ? (
        <Text className="mt-1 text-[11px] font-medium text-slate-500" numberOfLines={1}>
          {timeLabel}
        </Text>
      ) : subInfo ? (
        <Text className="mt-1 text-[11px] font-medium text-slate-600" numberOfLines={1}>
          {subInfo}
        </Text>
      ) : null}
    </Card>
  );
}
