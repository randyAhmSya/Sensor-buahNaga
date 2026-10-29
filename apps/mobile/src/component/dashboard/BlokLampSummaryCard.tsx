import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { BlokLampuSummary } from '@/types/notification';

interface BlokLampSummaryCardProps {
  summaries: BlokLampuSummary[];
}

export function BlokLampSummaryCard({ summaries }: BlokLampSummaryCardProps) {
  if (!summaries || summaries.length === 0) {
    return null;
  }

  return (
    <View className="mb-4 rounded-2xl bg-white p-4 border border-slate-200">
      <View className="flex-row items-center justify-between mb-3 border-b border-slate-200 pb-2.5">
        <View className="flex-row items-center gap-2">
          <View className="h-7 w-7 items-center justify-center rounded-lg bg-amber-50 border border-amber-200">
            <Ionicons name="bulb-outline" size={16} color="#D97706" />
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
          let badgeBg = 'bg-emerald-50 border border-emerald-300';
          let badgeText = 'text-emerald-800';
          let badgeLabel = `${blok.persentaseOnline}% Online`;

          if (blok.statusKoneksi === 'kosong') {
            badgeBg = 'bg-slate-100 border border-slate-300';
            badgeText = 'text-slate-700';
            badgeLabel = 'Tanpa Lampu';
          } else if (blok.statusKoneksi === 'semua_offline') {
            badgeBg = 'bg-rose-50 border border-rose-300';
            badgeText = 'text-rose-800';
            badgeLabel = 'Semua Offline';
          } else if (blok.statusKoneksi === 'sebagian_offline') {
            badgeBg = 'bg-amber-50 border border-amber-300';
            badgeText = 'text-amber-800';
            badgeLabel = `${blok.jumlahOffline} Offline`;
          }

          return (
            <View
              key={blok.idBlok}
              className="flex-row items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-200"
            >
              <View className="flex-1 mr-2" style={{ flexShrink: 1 }}>
                <Text className="text-xs font-bold text-slate-900" numberOfLines={1}>
                  {blok.namaBlok}
                </Text>
                <Text className="text-[11px] font-medium text-slate-600 mt-0.5" numberOfLines={1}>
                  {blok.namaKebun} • {blok.jumlahOnline}/{blok.jumlahLampu} Lampu Menyala
                </Text>
              </View>

              <View className={`rounded-full px-2.5 py-0.5 ${badgeBg}`}>
                <Text className={`text-[10px] font-bold ${badgeText}`}>
                  {badgeLabel}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
