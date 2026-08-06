import { View, Text, ScrollView } from "react-native";
import { AsyncStateView } from "@/component/ui/AsyncStateView";
import { Monitoring } from "@/component/monitoring/MonitorHeaders";
import { TAB_COLORS } from "@/constant/Tabs";
import { useMonitoring } from "@/hooks/useMonitoring";
import { SearchBar } from "@/component/monitoring/SearchBar";
import { FilterPills } from "@/component/monitoring/FilterPills";
import { NodeSection } from "@/component/monitoring/NodeSection";

export default function MonitoringScreen() {
  const {
    state,
    refetch,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filteredGroups,
  } = useMonitoring();

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
  return (
    <View className="flex-1 bg-gray-50 px-4 py-4">
      <Monitoring appName="Randy Ahmad Santoso" />
      <Text
        className="py-4 font-semibold text-lg"
        style={{ color: TAB_COLORS.subTitles }}
      >
        Halaman Monitoring
      </Text>
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <View>
        <FilterPills
          options={state.data.filters}
          activeKey={activeFilter}
          onSelect={setActiveFilter}
        />
      </View>
      <ScrollView>
        {filteredGroups.length === 0 ? (
          <View className="items-center px-4 pt-10">
            <Text className="text-sm text-gray-400">
              Gak ada node yang cocok
            </Text>
          </View>
        ) : (
          filteredGroups.map((group) => (
            <NodeSection
              key={group.dateLabel}
              group={group}
              onNodePress={(id) => console.log("node:", id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
