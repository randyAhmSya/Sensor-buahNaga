import React, { useState, useCallback } from "react";
import { ScrollView, View, Text, RefreshControl } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDashboard } from "@/hooks/useDashboard";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { AsyncStateView } from "@/component/ui/AsyncStateView";
import { WeatherHero } from "@/component/dashboard/WeatherHero";
import { StatsCards } from "@/component/dashboard/StatsCards";
import { BlokLampSummaryCard } from "@/component/dashboard/BlokLampSummaryCard";
import { QuickActions } from "@/component/dashboard/QuickActions";
import { ActivityList } from "@/component/dashboard/ActivityList";
import { ActionNeededList } from "@/component/dashboard/ActionNeededList";
import { HarvestEstimateList } from "@/component/dashboard/HarvestEstimateList";

export default function DashboardScreen() {
  const { userName, greetingName, today, state, refetch, isOffline } = useDashboard();
  const { data: unreadCount, refetch: refetchUnreadCount } = useUnreadNotificationCount();

  const [activeSection, setActiveSection] = useState("activity");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([refetch(), refetchUnreadCount()]);
    setRefreshing(false);
  }, [refetch, refetchUnreadCount]);

  const handleActionPress = useCallback((key: string) => {
    setActiveSection(key);
  }, []);

  const handleIssuePress = useCallback((_id: string) => {
    // Action handler untuk navigasi issue spesifik
  }, []);

  const handleSeeAllHarvest = useCallback(() => {
    router.push("/harvest/create" as never);
  }, []);

  const handleHarvestPress = useCallback((id: string) => {
    router.push({
      pathname: "/harvest/[id]",
      params: {
        id,
      },
    });
  }, []);

  if (state.status === "loading") return <AsyncStateView status="loading" />;
  if (state.status === "error") {
    return (
      <AsyncStateView
        status="error"
        errorMessage={state.message}
        onRetry={refetch}
      />
    );
  }

  const {
    kebunInfo,
    ringkasan,
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
        farmName={kebunInfo.nama_kebun}
        nodeStats={{
          online: ringkasan.node_online,
          total: ringkasan.jumlah_node,
        }}
        jumlahBlok={ringkasan.jumlah_blok}
        bacaanTerbaru={ringkasan.bacaan_terbaru}
        unreadNotificationCount={unreadCount}
        onNotificationPress={() => router.push("/notification" as never)}
      />

      {/* Banner Offline Tegas saat Menampilkan Data Cache */}
      {isOffline && (
        <View className="mx-4 mt-2 px-3.5 py-2.5 rounded-lg bg-white border-[1.5px] border-amber-500 flex-row items-center gap-2">
          <Ionicons name="cloud-offline" size={16} color="#B45309" />
          <Text className="text-xs font-bold text-amber-800 flex-1">
            Sedang offline, menampilkan data terakhir
          </Text>
        </View>
      )}

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
        {/* Ringkasan status lampu per blok */}
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
          {activeSection === "action-needed" && (
            <ActionNeededList
              groups={actionIssueGroups}
              onIssuePress={handleIssuePress}
            />
          )}

          {activeSection === "harvest-estimate" && (
            <HarvestEstimateList
              items={harvestEstimates}
              onSeeAllPress={handleSeeAllHarvest}
              onItemPress={handleHarvestPress}
            />
          )}

          {activeSection === "activity" && (
            <ActivityList />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
