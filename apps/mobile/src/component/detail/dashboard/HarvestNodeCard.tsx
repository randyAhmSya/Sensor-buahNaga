import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SiklusPanenItem } from '@/types/harvest';
import { StatusBadge } from '@/component/ui/StatusBadge';

interface HarvestNodeCardProps {
  data: SiklusPanenItem;
}

export function HarvestNodeCard({ data }: HarvestNodeCardProps) {
  const isBerjalan = data.status_siklus === 'BERJALAN';
  const isSelesai = data.status_siklus === 'SELESAI';

  let statusTone: "success" | "info" | "warning" = "warning";
  let statusLabel = data.status_siklus || 'Berjalan';

  if (isBerjalan) {
    statusTone = 'success';
    statusLabel = 'Sedang Berjalan';
  } else if (isSelesai) {
    statusTone = 'info';
    statusLabel = 'Panen Selesai';
  }

  const namaBlok = data.blok?.nama_blok || `Blok Lahan (${data.block_id.slice(0, 8)})`;
  const namaKebun = data.blok?.kebun?.nama_kebun || 'Kebun Buah Naga';

  return (
    <View className="mt-4 rounded-lg bg-white p-4 shadow-sm border border-slate-200">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1 mr-2">
          <View className="h-12 w-12 items-center justify-center rounded-lg bg-white border-[1.5px] border-slate-400">
            <Ionicons name="leaf-outline" size={24} color="#047857" />
          </View>

          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
              {namaBlok}
            </Text>
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              {namaKebun}
            </Text>
          </View>
        </View>

        <StatusBadge tone={statusTone} label={statusLabel} />
      </View>
    </View>
  );
}
