import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BlokLampuSummary } from '@/types/notification';
import { StatusBadge } from '@/component/ui/StatusBadge';
import type { BadgeTone } from '@/theme/tokens';

interface BlokLampSummaryCardProps {
  summaries: BlokLampuSummary[];
}

export function BlokLampSummaryCard({ summaries }: BlokLampSummaryCardProps) {
  if (!summaries || summaries.length === 0) {
    return null;
  }

  return (
    <View className="mb-4 rounded-lg bg-white p-4 border border-slate-200">
      <View className="flex-row items-center justify-between mb-3 border-b border-slate-200 pb-2.5">
        <View className="flex-row items-center gap-2">
          <View className="h-7 w-7 items-center justify-center rounded-md bg-amber-500">
            <Ionicons name="bulb-outline" size={16} color="#0F172A" />
          </View>
          <Text className="text-sm font-bold text-slate-900">
            Status Lampu per Blok
          </Text>
        </View>

        <Text className="text-xs font-semibold text-slate-600">
          {summaries.length} Blok Aktif
        </Text>
      </View>

      <View className="gap-2.5">
        {summaries.map((blok) => {
          let tone: BadgeTone = 'success';
          let badgeLabel = `${blok.persentaseOnline}% Online`;

          if (blok.statusKoneksi === 'kosong') {
            tone = 'neutral';
            badgeLabel = 'Tanpa Lampu';
          } else if (blok.statusKoneksi === 'semua_offline') {
            tone = 'danger';
            badgeLabel = 'Semua Offline';
          } else if (blok.statusKoneksi === 'sebagian_offline') {
            tone = 'warning';
            badgeLabel = `${blok.jumlahOffline} Offline`;
          }

          return (
            <View
              key={blok.idBlok}
              className="flex-row items-center justify-between bg-white rounded-lg p-3 border-[1.5px] border-slate-400"
            >
              <View className="flex-1 mr-2" style={{ flexShrink: 1 }}>
                <Text className="text-xs font-bold text-slate-900" numberOfLines={1}>
                  {blok.namaBlok}
                </Text>
                <Text className="text-[11px] font-medium text-slate-600 mt-0.5" numberOfLines={1}>
                  {blok.namaKebun} • {blok.jumlahOnline}/{blok.jumlahLampu} Lampu Menyala
                </Text>
              </View>

              <StatusBadge tone={tone} label={badgeLabel} size="sm" />
            </View>
          );
        })}
      </View>
    </View>
  );
}
