import React, { memo } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ListRowCard } from "@/component/ui/ListRowCard";
import { StatusBadge } from "@/component/ui/StatusBadge";
import type { MonitoringNode } from "@/constant/monitoring";
import { colors, border } from "@/theme/tokens";

interface NodeCardProps {
  node: MonitoringNode;
  onPress?: () => void;
}

export const NodeCard = memo(function NodeCard({
  node,
  onPress,
}: NodeCardProps) {
  const isOnline =
    node.statusKoneksi === "online" ||
    node.statusKoneksi === "terhubung";

  const isBelumTerlihat =
    node.statusKoneksi === "belum_pernah_terlihat" ||
    (!isOnline && (!node.time || node.time === "-" || node.time === "Belum ada data"));

  let tone: "success" | "danger" | "neutral" = "danger";
  let statusLabel = "Offline";

  if (isOnline) {
    statusLabel = "Online";
    tone = "success";
  } else if (isBelumTerlihat) {
    statusLabel = "Belum Terlihat";
    tone = "neutral";
  }

  const displayTime =
    !node.time || node.time === "-" || node.time === "Belum ada data"
      ? "Belum ada data"
      : node.time;

  const isBasi = !!node.isBasi;

  // Nilai pembacaan sensor aktual atau tanda strip
  const tempText =
    node.temperatureC !== null && node.temperatureC !== undefined
      ? `${node.temperatureC}°C`
      : "-";

  const luxText =
    node.lightLux !== null && node.lightLux !== undefined
      ? `${node.lightLux} Lux`
      : "-";

  return (
    <ListRowCard
      onPress={onPress}
      leading={
        <View
          className="h-10 w-10 items-center justify-center rounded-lg bg-white"
          style={{
            borderWidth: border.strong,
            borderColor: colors.border.neutral,
          }}
        >
          {/* Ikon wadah selalu netral solid (slate-700); status semantik dikomunikasikan lewat badge */}
          <Ionicons
            name={
              isOnline
                ? "hardware-chip-outline"
                : isBelumTerlihat
                  ? "help-circle-outline"
                  : "alert-circle-outline"
            }
            size={20}
            color={colors.icon.neutral}
          />
        </View>
      }
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-1 mr-2" style={{ flexShrink: 1 }}>
          <Text
            className="text-sm font-bold text-slate-900"
            numberOfLines={1}
          >
            {node.code || node.id}
          </Text>
        </View>
        <StatusBadge tone={tone} label={statusLabel} size="sm" />
      </View>

      <Text className="mt-0.5 text-xs text-slate-600" numberOfLines={1}>
        {node.location || "Blok Kebun"}
      </Text>

      {/* Baris Pembacaan Sensor: Suhu & Lux */}
      <View className="mt-2 flex-row items-center gap-3">
        <View className="flex-row items-center gap-1">
          <Ionicons
            name="thermometer-outline"
            size={13}
            color={colors.icon.muted}
          />
          <Text
            className={
              isBasi
                ? "text-xs font-medium text-slate-500"
                : "text-xs font-semibold text-slate-700"
            }
          >
            {tempText}
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          <Ionicons
            name="sunny-outline"
            size={13}
            color={colors.icon.muted}
          />
          <Text
            className={
              isBasi
                ? "text-xs font-medium text-slate-500"
                : "text-xs font-semibold text-slate-700"
            }
          >
            {luxText}
          </Text>
        </View>

        <View className="flex-row items-center gap-1 ml-auto">
          <Ionicons
            name="time-outline"
            size={12}
            color={colors.icon.subtle}
          />
          <Text className="text-xs font-medium text-slate-600">
            {displayTime}
          </Text>
        </View>
      </View>

      {/* Keterangan Data Basi bila status bacaan basi */}
      {isBasi && (
        <View className="mt-1 flex-row items-center gap-1">
          <Ionicons
            name="alert-circle-outline"
            size={11}
            color={colors.icon.subtle}
          />
          <Text className="text-xs font-medium text-slate-500">
            {node.waktuRelatif
              ? `terakhir diperbarui ${node.waktuRelatif}`
              : "data lama (sensor tidak aktif)"}
          </Text>
        </View>
      )}
    </ListRowCard>
  );
});
