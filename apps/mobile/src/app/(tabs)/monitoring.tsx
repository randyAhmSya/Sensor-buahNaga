import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  type ListRenderItem,
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
import type { MonitoringGroup } from "@/constant/monitoring";

export default function MonitoringScreen() {
  const {
    state,
    refetch,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    filteredGroups,
    summary,
    isOffline,
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

  const renderGroupItem: ListRenderItem<MonitoringGroup> = useCallback(
    ({ item: group }) => (
      <NodeSection
        group={group}
        onNodePress={handleNodePress}
      />
    ),
    [handleNodePress],
  );

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-slate-50" edges={["top", "left", "right"]}>
      {/* Header */}
      <View className="border-b border-slate-200 bg-white px-5 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Monitoring Jaringan
            </Text>
            <Text className="text-xl font-extrabold text-slate-900">
              Daftar Node Sensor
            </Text>
            <Text className="mt-0.5 text-xs text-slate-600">
              {summary.total > 0
                ? `${summary.total} node sensor terhubung kebun`
                : "Memantau telemetri seluruh node sensor"}
            </Text>
          </View>
        </View>

        {/* Node Status Summary Strip Utilitarian - Latar Putih Solid + Border 1.5px Tegas */}
        <View className="mt-3 flex-row gap-2">
          <View className="flex-1 rounded-lg bg-white border-[1.5px] border-slate-400 p-2 items-center">
            <Text className="text-xs font-black text-slate-900">{summary.total}</Text>
            <Text className="text-[10px] font-semibold text-slate-700">Total Node</Text>
          </View>
          <View className="flex-1 rounded-lg bg-white border-[1.5px] border-[#047857] p-2 items-center">
            <Text className="text-xs font-black text-emerald-800">{summary.online}</Text>
            <Text className="text-[10px] font-semibold text-emerald-700">Online</Text>
          </View>
          <View className="flex-1 rounded-lg bg-white border-[1.5px] border-[#DC2626] p-2 items-center">
            <Text className="text-xs font-black text-rose-800">{summary.offline}</Text>
            <Text className="text-[10px] font-semibold text-rose-700">Offline</Text>
          </View>
          <View className="flex-1 rounded-lg bg-white border-[1.5px] border-slate-400 p-2 items-center">
            <Text className="text-xs font-black text-slate-900">{summary.belumTerlihat}</Text>
            <Text className="text-[10px] font-semibold text-slate-700">Belum Terlihat</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="mt-3">
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

      {/* Banner Offline Tegas - Latar Putih Solid + Border 1.5px Amber */}
      {isOffline && (
        <View className="mx-4 mt-2 px-3.5 py-2 rounded-lg bg-white border-[1.5px] border-amber-500 flex-row items-center gap-2">
          <Ionicons name="cloud-offline" size={16} color="#B45309" />
          <Text className="text-xs font-bold text-amber-900 flex-1">
            Sedang offline, menampilkan data terakhir
          </Text>
        </View>
      )}

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
            <View style={{ flex: 1 }} className="flex-1 justify-center px-4">
              <EmptyNodeScanState
                title={
                  searchQuery.trim() !== "" || activeFilter !== "all"
                    ? "Node Tidak Ditemukan"
                    : "Belum Ada Node Terhubung"
                }
                description={
                  searchQuery.trim() !== "" || activeFilter !== "all"
                    ? "Tidak ada node sensor yang cocok dengan kata kunci atau filter yang Anda pilih."
                    : "Gunakan tombol Scan di menu navigasi bawah untuk menghubungkan fisik node sensor ke sistem."
                }
              />
            </View>
          ) : (
            <FlatList
              data={filteredGroups}
              keyExtractor={(group) => group.dateLabel}
              renderItem={renderGroupItem}
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 100, paddingTop: 6, paddingHorizontal: 16 }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}
