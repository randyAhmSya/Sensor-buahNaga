import React, { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { AsyncStateView } from '@/component/ui/AsyncStateView';
import { ProfileHeader } from '@/component/profile/ProfileHeader';
import { useProfile } from '@/hooks/useProfile';
import { ProfileCard } from '@/component/profile/ProfileCard';
import { ProfileStats } from '@/component/profile/ProfileStats';
import { ProfileMenu } from '@/component/profile/ProfileMenu';
import { LogoutButton } from '@/component/profile/LogoutButton';
import { router } from 'expo-router';
import { authService } from '@/service/authService';
import { queryClient } from '@/lib/queryClient';
import { FITUR_LANGGANAN } from '@/config/features';

export default function ProfileScreen() {
  const { state, refetch } = useProfile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari akun AgroLight?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await authService.logout();
              queryClient.clear();
              router.replace('/login');
            } catch (e) {
              console.warn('[ProfileScreen] Logout error:', e);
              queryClient.clear();
              router.replace('/login');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
    );
  };

  if (state.status === 'loading') return <AsyncStateView status="loading" />;
  if (state.status === 'error') {
    return (
      <AsyncStateView
        status="error"
        errorMessage={state.message}
        onRetry={refetch}
      />
    );
  }

  const { user, menu } = state.data;
  const activeMenu = FITUR_LANGGANAN
    ? menu
    : menu.filter((item) => item.key !== 'subscription');

  return (
    <View className="flex-1 bg-slate-50">
      <ProfileHeader onSettingsPress={() => router.push('/profile/account-setting' as never)} />
      <ProfileCard user={user} />
      <ProfileStats user={user} />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        <ProfileMenu
          items={activeMenu}
          onItemPress={(key) => {
            switch (key) {
              case 'notifications':
                router.push('/profile/notification' as never);
                break;

              case 'account-settings':
                router.push('/profile/account-setting' as never);
                break;

              case 'subscription':
                if (FITUR_LANGGANAN) {
                  router.push('/subscription' as never);
                }
                break;

              default:
                console.log('Menu dipilih:', key);
            }
          }}
        />
        <LogoutButton onPress={handleLogout} />
      </ScrollView>
    </View>
  );
}
