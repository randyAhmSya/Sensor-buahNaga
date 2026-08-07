import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useDashboard } from "@/hooks/useDashboard";
import { AsyncStateView } from "@/component/ui/AsyncStateView";
import { WeatherHero } from "@/component/dashboard/WeatherHero";
import { StatsCards } from "@/component/dashboard/StatsCards";
import { QuickActions } from "@/component/dashboard/QuickActions";
import { ActivityList } from "@/component/dashboard/ActivityList";
import { ActivityHeaders } from "@/component/dashboard/ActivityHeaders";
import { ActionNeededList } from "@/component/dashboard/ActionNededList";
import { HarvestEstimateList } from "@/component/dashboard/HarvestEstimateList";

export default function DashboardScreen() {
  const { greetingName, today, state, refetch } = useDashboard();

  const [activeSection, setActiveSection] = useState("activity");

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
    weather,
    stats,
    quickActions,
    activities,
    harvestEstimates,
    actionIssueGroups,
  } = state.data;

  return (
    <View className="flex-1 bg-gray-50">
      <WeatherHero
        appName="Randy Ahmad Santoso"
        greetingName={greetingName}
        today={today}
        weather={weather}
      />

      <StatsCards stats={stats} />

      <View className="pb-3 px-4">
        <QuickActions
          actions={quickActions}
          activeKey={activeSection}
          onActionPress={(key) => setActiveSection(key)}
        />
      </View>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
          paddingTop: 10,
        }}
      >
        {activeSection === "action-needed" && (
          <ActionNeededList
            groups={actionIssueGroups}
            onIssuePress={(id) => console.log("issue:", id)}
          />
        )}

        {activeSection === "harvest-estimate" && (
          <HarvestEstimateList
            items={harvestEstimates}
            onSeeAllPress={() => console.log("lihat semua panen")}
            onItemPress={(id) => console.log("harvest:", id)}
          />
        )}

        {activeSection === "activity" && (
          <>
            <ActivityList
              activities={activities}
              onItemPress={(id) => console.log("activity:", id)}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}
