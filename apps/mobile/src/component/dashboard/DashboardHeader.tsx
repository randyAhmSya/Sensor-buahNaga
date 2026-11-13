import { TAB_COLORS } from '@/constant/Tabs';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { PressableOpacity } from '../ui/PressableOpacity';
import { colors } from '@/theme/tokens';

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
          isLight ? 'text-slate-900' : 'text-white'
        }`}
      >
        {appName}
      </Text>

      <PressableOpacity
        onPress={onNotificationPress}
        className={`relative h-11 w-11 items-center justify-center rounded-full border-[1.5px] ${
          isLight
            ? 'border-slate-400 bg-white'
            : 'border-slate-400 bg-white'
        }`}
        accessibilityLabel="Notifikasi"
        accessibilityRole="button"
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <Ionicons
          name="notifications-outline"
          size={20}
          color={colors.icon.neutral}
        />

        {unreadCount > 0 && (
          <View
            className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full border border-white"
            style={{ backgroundColor: colors.status.danger.bg }}
          />
        )}
      </PressableOpacity>
    </View>
  );
}