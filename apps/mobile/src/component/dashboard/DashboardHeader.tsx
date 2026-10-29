import { TAB_COLORS } from '@/constant/Tabs';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { PressableOpacity } from '../ui/PressableOpacity';

interface DashboardHeaderProps {
  appName: string;
  onNotificationPress?: () => void;
  tone?: 'dark' | 'light';
  unreadCount?: number;
}

export function DashboardHeader({
  appName,
  onNotificationPress,
  tone = 'dark',
  unreadCount = 0,
}: DashboardHeaderProps) {
  const isLight = tone === 'light';

  return (
    <View className="flex-row items-center justify-between pb-3">
      <Text
        className={`text-lg font-bold tracking-tight ${
          isLight ? 'text-gray-900' : 'text-white'
        }`}
      >
        {appName}
      </Text>

      <PressableOpacity
        onPress={onNotificationPress}
        className={`relative h-10 w-10 items-center justify-center rounded-full border ${
          isLight
            ? 'border-gray-200 bg-white'
            : 'border-white/20 bg-white/10 backdrop-blur-md'
        }`}
        accessibilityLabel="Notifikasi"
        accessibilityRole="button"
      >
        <Ionicons
          name="notifications-outline"
          size={20}
          color={isLight ? TAB_COLORS.active : '#FFFFFF'}
        />

        {unreadCount > 0 && (
          <View className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border border-white" />
        )}
      </PressableOpacity>
    </View>
  );
}