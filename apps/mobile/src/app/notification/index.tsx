import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from '@/hooks/useNotifications';
import type { NotifikasiItem } from '@/types/notification';

export default function NotificationScreen() {
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);

  const {
    data: result,
    isLoading,
    isRefetching,
    refetch,
  } = useNotifications({
    belum_dibaca: filterUnreadOnly,
    per_page: 30,
  });

  const { data: unreadCount = 0, refetch: refetchUnreadCount } = useUnreadNotificationCount();
  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();

  const notifications = useMemo(() => result?.items ?? [], [result]);
  const hasUnread = (unreadCount ?? 0) > 0;

  const handleRefresh = useCallback(async () => {
    await Promise.allSettled([refetch(), refetchUnreadCount()]);
  }, [refetch, refetchUnreadCount]);

  const handleMarkAsRead = (item: NotifikasiItem) => {
    if (!item.dibaca_pada) {
      markAsReadMutation.mutate(item.id_notifikasi);
    }
  };

  const handleMarkAll = () => {
    if (!hasUnread) return;
    Alert.alert(
      'Tandai Semua Dibaca',
      'Apakah Anda yakin ingin menandai seluruh notifikasi sebagai sudah dibaca?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Tandai',
          onPress: () => markAllAsReadMutation.mutate(),
        },
      ],
    );
  };

  const renderIcon = (tipe: string) => {
    switch (tipe) {
      case 'peringatan':
      case 'HARDWARE_ALERT':
        return <Ionicons name="hardware-chip-outline" size={20} color="#E11D48" />;
      case 'panen':
      case 'AGRONOMI_ALERT':
        return <Ionicons name="leaf-outline" size={20} color="#059669" />;
      case 'langganan':
        return <Ionicons name="card-outline" size={20} color="#059669" />;
      default:
        return <Ionicons name="information-circle-outline" size={20} color="#2563EB" />;
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5 pt-12">
        <Pressable
          onPress={() => router.back()}
          className="h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200"
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </Pressable>

        <Text className="text-base font-bold text-slate-900">Notifikasi</Text>

        <Pressable
          onPress={handleMarkAll}
          disabled={!hasUnread || markAllAsReadMutation.isPending}
          className="h-9 items-center justify-center px-2"
        >
          {markAllAsReadMutation.isPending ? (
            <ActivityIndicator size="small" color="#059669" />
          ) : (
            <Text
              className={`text-xs font-bold ${
                hasUnread ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              Baca Semua
            </Text>
          )}
        </Pressable>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row border-b border-slate-200 bg-white px-4 py-2 gap-2">
        <Pressable
          onPress={() => setFilterUnreadOnly(false)}
          className={`rounded-xl px-3 py-1.5 ${
            !filterUnreadOnly
              ? 'bg-emerald-700'
              : 'bg-slate-100 border border-slate-200'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              !filterUnreadOnly ? 'text-white' : 'text-slate-700'
            }`}
          >
            Semua
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setFilterUnreadOnly(true)}
          className={`flex-row items-center gap-1.5 rounded-xl px-3 py-1.5 ${
            filterUnreadOnly
              ? 'bg-emerald-700'
              : 'bg-slate-100 border border-slate-200'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              filterUnreadOnly ? 'text-white' : 'text-slate-700'
            }`}
          >
            Belum Dibaca
          </Text>
          {hasUnread && (
            <View
              className={`h-4 min-w-[16px] items-center justify-center rounded-full px-1 ${
                filterUnreadOnly ? 'bg-white' : 'bg-rose-600'
              }`}
            >
              <Text
                className={`text-[10px] font-bold ${
                  filterUnreadOnly ? 'text-emerald-800' : 'text-white'
                }`}
              >
                {(unreadCount ?? 0) > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* List Feed */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="notifications-off-outline" size={48} color="#64748B" />
          <Text className="mt-3 text-sm font-bold text-slate-800">
            Tidak Ada Notifikasi
          </Text>
          <Text className="mt-1 text-center text-xs text-slate-600">
            {filterUnreadOnly
              ? 'Semua notifikasi penting telah Anda baca.'
              : 'Belum ada riwayat aktivitas terbaru di kebun Anda.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id_notifikasi}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              colors={['#059669']}
            />
          }
          renderItem={({ item }) => {
            const isUnread = !item.dibaca_pada;
            return (
              <Pressable
                onPress={() => handleMarkAsRead(item)}
                className={`flex-row items-start gap-3 border-b border-slate-200 p-4 ${
                  isUnread ? 'bg-emerald-50' : 'bg-white'
                }`}
              >
                <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
                  {renderIcon(item.tipe)}
                </View>

                <View className="flex-1" style={{ flexShrink: 1 }}>
                  <View className="flex-row items-center justify-between gap-2">
                    <Text
                      className={`text-sm flex-1 mr-1 ${
                        isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'
                      }`}
                      numberOfLines={1}
                    >
                      {item.judul}
                    </Text>
                    {isUnread && (
                      <View className="h-2 w-2 rounded-full bg-emerald-600" />
                    )}
                  </View>

                  <Text className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {item.pesan}
                  </Text>

                  <Text className="mt-2 text-[10px] font-medium text-slate-600">
                    {new Date(item.created_at).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
