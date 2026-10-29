import React, { useState, useCallback } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useDashboard } from '@/hooks/useDashboard';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { AsyncStateView } from '@/component/ui/AsyncStateView';
import { WeatherHero } from '@/component/dashboard/WeatherHero';
import { StatsCards } from '@/component/dashboard/StatsCards';
import { BlokLampSummaryCard } from '@/component/dashboard/BlokLampSummaryCard';
import { QuickActions } from '@/component/dashboard/QuickActions';
import { ActivityList } from '@/component/dashboard/ActivityList';
import { ActionNeededList } from '@/component/dashboard/ActionNeededList';
import { HarvestEstimateList } from '@/component/dashboard/HarvestEstimateList';

export default function DashboardScreen() {
  const { userName, greetingName, today, state, refetch } = useDashboard();
  const { data: unreadCount, refetch: refetchUnreadCount } = useUnreadNotificationCount();

  const [activeSection, setActiveSection] = useState('activity');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([refetch(), refetchUnreadCount()]);
    setRefreshing(false);
  }, [refetch, refetchUnreadCount]);

  const handleActionPress = useCallback((key: string) => {
    setActiveSection(key);
  }, []);

  const handleIssuePress = useCallback((id: string) => {
    console.log('issue:', id);
  }, []);

  const handleSeeAllHarvest = useCallback(() => {
    router.push('/harvest/create' as never);
  }, []);

  const handleHarvestPress = useCallback((id: string) => {
    router.push({
      pathname: '/harvest/[id]',
      params: {
        id,
      },
    });
  }, []);

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

  const {
    weather,
    stats,
    quickActions,
    harvestEstimates,
    actionIssueGroups,
    blokLampuSummaries,
  } = state.data;

  return (
    <View className="flex-1 bg-slate-50">
      <WeatherHero
        appName={userName}
        greetingName={greetingName}
        today={today}
        weather={weather}
        unreadNotificationCount={unreadCount}
        onNotificationPress={() => router.push('/notification' as never)}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
          paddingTop: 8,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Ringkasan status lampu per blok (BlokStatusController) */}
        {blokLampuSummaries && blokLampuSummaries.length > 0 && (
          <View className="px-4">
            <BlokLampSummaryCard summaries={blokLampuSummaries} />
          </View>
        )}

        <StatsCards stats={stats} />

        <View className="pb-3 px-4 pt-1">
          <QuickActions
            actions={quickActions}
            activeKey={activeSection}
            onActionPress={handleActionPress}
          />
        </View>

        <View className="px-4">
          {activeSection === 'action-needed' && (
            <ActionNeededList
              groups={actionIssueGroups}
              onIssuePress={handleIssuePress}
            />
          )}

          {activeSection === 'harvest-estimate' && (
            <HarvestEstimateList
              items={harvestEstimates}
              onSeeAllPress={handleSeeAllHarvest}
              onItemPress={handleHarvestPress}
            />
          )}

          {activeSection === 'activity' && (
            <ActivityList
              onSeeAllPress={() => router.push('/activity')}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
