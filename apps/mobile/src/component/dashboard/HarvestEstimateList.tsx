import React, { memo, useCallback } from 'react';
import { Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { HarvestEstimate } from '@/constant/dashboard';
import { HarvestEstimateCard } from './HarvestEstimateCard';

interface HarvestEstimateListProps {
  items: HarvestEstimate[];
  onSeeAllPress?: () => void;
  onItemPress?: (id: string) => void;
}

export const HarvestEstimateList = memo(function HarvestEstimateList({
  items,
  onSeeAllPress,
  onItemPress,
}: HarvestEstimateListProps) {
  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-bold text-slate-900">Estimasi Panen</Text>
          <View className="bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
            <Text className="text-xs font-bold text-emerald-800">{items.length}</Text>
          </View>
        </View>

        <Pressable
          onPress={() => router.push('/harvest/create')}
          className="flex-row items-center gap-1 rounded-xl bg-emerald-700 px-3 py-1.5 active:bg-emerald-800"
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text className="text-xs font-bold text-white">Mulai Siklus</Text>
        </Pressable>
      </View>

      {items.length === 0 ? (
        <View className="items-center justify-center rounded-2xl bg-white p-6 border border-slate-200">
          <Ionicons name="leaf-outline" size={36} color="#059669" />
          <Text className="mt-2 text-sm font-bold text-slate-800">
            Belum Ada Siklus Panen Aktif
          </Text>
          <Text className="mt-1 text-center text-xs text-slate-600 mb-4">
            Mulai penyinaran lampu di blok lahan untuk menghitung proyeksi panen.
          </Text>
          <Pressable
            onPress={() => router.push('/harvest/create')}
            className="rounded-xl bg-emerald-700 px-4 py-2"
          >
            <Text className="text-xs font-bold text-white">+ Mulai Siklus Sekarang</Text>
          </Pressable>
        </View>
      ) : (
        items.slice(0, 8).map((item) => (
          <HarvestEstimateListItem
            key={item.id}
            item={item}
            onItemPress={onItemPress}
          />
        ))
      )}
    </View>
  );
});

interface HarvestEstimateListItemProps {
  item: HarvestEstimate;
  onItemPress?: (id: string) => void;
}

const HarvestEstimateListItem = memo(function HarvestEstimateListItem({
  item,
  onItemPress,
}: HarvestEstimateListItemProps) {
  const handlePress = useCallback(() => {
    // Pastikan mengirim item.id (UUID id_siklus_panen riil dari backend)
    onItemPress?.(item.id);
  }, [item.id, onItemPress]);

  return <HarvestEstimateCard item={item} onPress={handlePress} />;
});
