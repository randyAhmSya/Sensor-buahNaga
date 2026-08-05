import React from "react";
import { ScrollView, View } from "react-native";
import { useDashboard } from "@/hooks/useDashboard";
import { AsyncStateView } from "@/component/ui/AsyncStateView";
import { WeatherHero } from "@/component/dashboard/WeatherHero";
import { StatsCards } from "@/component/dashboard/StatsCards";
import { QuickActions } from "@/component/dashboard/QuickActions";
import { ActivityList } from "@/component/dashboard/ActivityList";

export default function DashboardScreen() {
  const { greetingName, today, state, refetch } = useDashboard();

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

  const { weather, stats, quickActions, activities } = state.data;

  return (
    <View className="flex-1 bg-gray-50">
      {/* 1. BAGIAN TETAP (Fixed di atas): WeatherHero, StatsCards, & QuickActions */}
      <WeatherHero
        appName="Randy Ahmad Santoso"
        greetingName={greetingName}
        today={today}
        weather={weather}
      />
      <StatsCards stats={stats} />
      <View className="flex-row">
        <QuickActions
          actions={quickActions}
          onActionPress={(key) => console.log("action:", key)}
        />
      </View>

      {/* 2. BAGIAN YANG BISA DI-SCROLL: Hanya ActivityList ke bawah */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
      >
        <ActivityList
          activities={activities}
          onSeeAllPress={() => console.log("lihat semua")}
          onItemPress={(id) => console.log("activity:", id)}
        />
      </ScrollView>
    </View>
  );
}
