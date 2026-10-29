import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { SiklusPanenItem } from '@/types/harvest';

interface HarvestNodeCardProps {
  data: SiklusPanenItem;
}

export function HarvestNodeCard({ data }: HarvestNodeCardProps) {
  const isBerjalan = data.status_siklus === 'BERJALAN';
  const isSelesai = data.status_siklus === 'SELESAI';

  let statusBg = 'bg-amber-100';
  let statusText = 'text-amber-800';
  let statusLabel = data.status_siklus || 'Berjalan';

  if (isBerjalan) {
    statusBg = 'bg-green-100';
    statusText = 'text-green-800';
    statusLabel = 'Sedang Berjalan';
  } else if (isSelesai) {
    statusBg = 'bg-blue-100';
    statusText = 'text-blue-800';
    statusLabel = 'Panen Selesai';
  }

  const namaBlok = data.blok?.nama_blok || `Blok Lahan (${data.block_id.slice(0, 8)})`;
  const namaKebun = data.blok?.kebun?.nama_kebun || 'Kebun Buah Naga';

  return (
    <View className="mt-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1 mr-2">
          <View className="h-12 w-12 items-center justify-center rounded-xl bg-green-50">
            <Ionicons name="leaf-outline" size={24} color="#166534" />
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

        <View className={`rounded-full px-3 py-1 ${statusBg}`}>
          <Text className={`text-xs font-bold ${statusText}`}>
            {statusLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}