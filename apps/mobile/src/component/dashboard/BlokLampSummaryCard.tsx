import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { BlokLampuSummary } from "@/types/notification";
import { StatusBadge } from "@/component/ui/StatusBadge";
import { GlassCard } from "@/component/ui/GlassCard";
import { colors, type BadgeTone } from "@/theme/tokens";

interface BlokLampSummaryCardProps {
  summaries: BlokLampuSummary[];
}

export function BlokLampSummaryCard({ summaries }: BlokLampSummaryCardProps) {
  if (!summaries || summaries.length === 0) {
    return null;
  }

  return (
    <GlassCard className="mb-4 p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <Ionicons name="bulb" size={22} color={colors.statIcon.lampu} />
          <Text className="text-base font-bold text-slate-900">
            Status Lampu per Blok
          </Text>
        </View>

        <View className="rounded-full bg-slate-100 px-2.5 py-1">
          <Text className="text-xs font-semibold text-slate-600">
            {summaries.length} Blok
          </Text>
        </View>
      </View>

      <View className="gap-2.5">
        {summaries.map((blok) => {
          let tone: BadgeTone = "success";
          let badgeLabel = `${blok.persentaseOnline}% Online`;

          if (blok.statusKoneksi === "kosong") {
            tone = "neutral";
            badgeLabel = "Tanpa Lampu";
          } else if (blok.statusKoneksi === "semua_offline") {
            tone = "danger";
            badgeLabel = "Semua Offline";
          } else if (blok.statusKoneksi === "sebagian_offline") {
            tone = "warning";
            badgeLabel = `${blok.jumlahOffline} Offline`;
          }

          const gaya = colors.tone[tone];

          return (
            <View
              key={blok.idBlok}
              className="flex-row items-center justify-between rounded-2xl p-3.5"
              style={{
                // Tanpa latar berwarna: garis tepi berwarna status + bayangan sewarna
                backgroundColor: colors.glass.background,
                borderWidth: 1.5,
                borderColor: gaya.border,
                boxShadow: gaya.shadow,
              }}
            >
              <View
                className="mr-2 flex-1 flex-row items-center gap-3"
                style={{ flexShrink: 1 }}
              >
                <View
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: gaya.dot }}
                />
                <View style={{ flexShrink: 1 }}>
                  <Text
                    className="text-sm font-bold text-slate-900"
                    numberOfLines={1}
                  >
                    {blok.namaBlok}
                  </Text>
                  <Text
                    className="mt-0.5 text-xs font-medium text-slate-600"
                    numberOfLines={1}
                  >
                    {blok.namaKebun} • {blok.jumlahOnline}/{blok.jumlahLampu}{" "}
                    lampu online
                  </Text>
                </View>
              </View>

              <StatusBadge tone={tone} label={badgeLabel} size="sm" />
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
}
