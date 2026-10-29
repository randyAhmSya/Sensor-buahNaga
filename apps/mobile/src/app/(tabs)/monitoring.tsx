import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMonitoring } from "@/hooks/useMonitoring";
import { SearchBar } from "@/component/monitoring/SearchBar";
import { FilterPills } from "@/component/monitoring/FilterPills";
import { NodeSection } from "@/component/monitoring/NodeSection";
import { EmptyNodeScanState } from "@/component/detail/monitoring/EmptyNodeScanState";
import { AsyncStateView } from "@/component/ui/AsyncStateView";

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

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleNodePress = useCallback((nodeId: string) => {
    router.push({
      pathname: "/monitoring/[id]",
      params: { id: nodeId },
    });
  }, []);

  const totalNodes =
    state.status === "success"
      ? state.data.groups.reduce((acc, g) => acc + g.nodes.length, 0)
      : 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right"]}>
      {/* Header */}
      <View className="border-b border-gray-100 bg-white px-5 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Monitoring Jaringan
            </Text>
            <Text className="text-xl font-extrabold text-gray-900">
              Daftar Node Sensor
            </Text>
            <Text className="mt-0.5 text-xs text-gray-500">
              {totalNodes > 0
                ? `${totalNodes} node sensor terhubung kebun`
                : "Memantau telemetri seluruh node sensor"}
            </Text>
          </View>

          <Pressable
            onPress={() => router.push("/scan")}
            className="flex-row items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-2 active:bg-emerald-100"
            accessibilityRole="button"
            accessibilityLabel="Pindai QR Node Baru"
          >
            <Ionicons name="scan-outline" size={16} color="#15803d" />
            <Text className="text-xs font-bold text-emerald-800">Scan QR</Text>
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className="mt-4">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari kode node, kebun, atau blok..."
          />
        </View>

        {/* Filter Pills */}
        <FilterPills
          options={
            state.status === "success"
              ? state.data.filters
              : [
                  { key: "all", label: "Semua" },
                  { key: "active", label: "Aktif" },
                  { key: "inactive", label: "Inactive" },
                ]
          }
          activeKey={activeFilter}
          onSelect={setActiveFilter}
        />
      </View>

      {/* Main Content */}
      {state.status === "loading" && <AsyncStateView status="loading" />}

      {state.status === "error" && (
        <AsyncStateView
          status="error"
          errorMessage={state.message}
          onRetry={refetch}
        />
      )}

      {state.status === "success" && (
        <>
          {filteredGroups.length === 0 ? (
            <View className="flex-1 justify-center px-4">
              <EmptyNodeScanState
                title={
                  searchQuery.trim() !== "" || activeFilter !== "all"
                    ? "Node Tidak Ditemukan"
                    : "Belum Ada Node Terhubung"
                }
                description={
                  searchQuery.trim() !== "" || activeFilter !== "all"
                    ? "Tidak ada node sensor yang cocok dengan kata kunci atau filter yang Anda pilih."
                    : "Pindai QR code pada fisik node sensor Anda untuk menghubungkannya ke sistem pemantauan kebun."
                }
                buttonText="Pindai QR Node Baru"
                onScanPress={() => router.push("/scan")}
              />
            </View>
          ) : (
            <ScrollView
              className="flex-1 px-4"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 120, paddingTop: 6 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {filteredGroups.map((group) => (
                <NodeSection
                  key={group.dateLabel}
                  group={group}
                  onNodePress={handleNodePress}
                />
              ))}
            </ScrollView>
          )}

          {/* Floating Action Button (FAB) "Pindai QR Node Baru" */}
          <Pressable
            onPress={() => router.push("/scan")}
            className="absolute right-5 bottom-28 flex-row items-center gap-2 rounded-full bg-emerald-800 px-4 py-3 shadow-lg active:bg-emerald-900"
            style={{ elevation: 6 }}
            accessibilityRole="button"
            accessibilityLabel="Pindai QR Node Baru"
          >
            <Ionicons name="scan-outline" size={18} color="#ffffff" />
            <Text className="text-xs font-bold text-white tracking-wide">
              Pindai QR Baru
            </Text>
          </Pressable>
        </>
      )}
    </SafeAreaView>
  );
}
