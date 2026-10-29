import React from 'react';
import { Text, View } from 'react-native';

interface ProgressProps {
  percent: number;
  statusLabel?: string;
}

export function Progress({ percent, statusLabel = 'Siap Panen' }: ProgressProps) {
  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <View className="mt-4 rounded-xl bg-white p-4 border border-gray-100 shadow-sm">
      <View className="flex-row justify-between items-center">
        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Estimasi Kematangan Buah
        </Text>

        <Text className="font-bold text-green-700 text-sm">
          {clampedPercent}% - {statusLabel}
        </Text>
      </View>

      <View className="mt-3 h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <View
          className="h-2.5 rounded-full bg-green-600"
          style={{
            width: `${clampedPercent}%`,
          }}
        />
      </View>
    </View>
  );
}