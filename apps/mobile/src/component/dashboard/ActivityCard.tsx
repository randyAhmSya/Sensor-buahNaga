import React, { memo } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/component/ui/Card";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import type { QrScanLogItem } from "@/service/qrScanService";

interface ActivityCardProps {
  log: QrScanLogItem;
  onPress?: () => void;
}

export function formatDicatatPada(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const datePart = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart}, ${timePart} WIB`;
  } catch {
    return dateStr;
  }
}

export const ActivityCard = memo(function ActivityCard({
  log,
  onPress,
}: ActivityCardProps) {
  const isSuccess =
    log.status_scan === "berhasil" || log.status_scan === "sukses";

  const statusLabel = isSuccess ? "Berhasil" : "Gagal";
  const badgeTextColor = isSuccess ? "#065F46" : "#9F1239";
  const badgeBgColor = isSuccess ? "#ECFDF5" : "#FFF1F2";
  const badgeBorderColor = isSuccess ? "#A7F3D0" : "#FECDD3";
  const iconName = isSuccess ? "qr-code-outline" : "close-circle-outline";
  const iconColor = isSuccess ? "#059669" : "#E11D48";
  const iconBgColor = isSuccess ? "#ECFDF5" : "#FFF1F2";

  const qrText = log.teks_kode_qr || "QR Node";
  const nodeText = log.kode_perangkat
    ? `Node: ${log.kode_perangkat}`
    : undefined;

  const platformText = log.platform
    ? log.platform.charAt(0).toUpperCase() + log.platform.slice(1)
    : "Mobile";

  return (
    <PressableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card className="mb-3 flex-row items-center gap-3 p-3.5 border border-slate-200 bg-white">
        {/* Leading Icon */}
        <View
          className="h-11 w-11 items-center justify-center rounded-xl border border-slate-200"
          style={{ backgroundColor: iconBgColor }}
        >
          <Ionicons name={iconName} size={22} color={iconColor} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-1 mr-2" style={{ flexShrink: 1 }}>
              <Text
                className="text-sm font-bold text-slate-900"
                numberOfLines={1}
              >
                {qrText}
              </Text>
            </View>
            <View
              className="rounded-full px-2 py-0.5 border"
              style={{
                backgroundColor: badgeBgColor,
                borderColor: badgeBorderColor,
              }}
            >
              <Text
                className="text-[10px] font-bold"
                style={{ color: badgeTextColor }}
              >
                {statusLabel}
              </Text>
            </View>
          </View>

          {nodeText && (
            <Text className="text-xs font-semibold text-emerald-800 mt-0.5">
              {nodeText}
            </Text>
          )}

          <View className="mt-1 flex-row items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="phone-portrait-outline" size={12} color="#475569" />
              <Text className="text-xs text-slate-600">{platformText}</Text>
            </View>

            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={12} color="#475569" />
              <Text className="text-xs text-slate-600">
                {formatDicatatPada(log.dicatat_pada)}
              </Text>
            </View>
          </View>
        </View>

        {/* Trailing Chevron */}
        <Ionicons name="chevron-forward" size={16} color="#64748B" />
      </Card>
    </PressableOpacity>
  );
});
