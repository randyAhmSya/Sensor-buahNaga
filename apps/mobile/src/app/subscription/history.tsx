import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSubscriptionHistory } from "@/hooks/useSubscription";
import type { TransaksiLangganan } from "@/types/subscription";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTanggal(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const isSuccess = normalized === "berhasil" || normalized === "diverifikasi";
  const isPending =
    normalized === "menunggu_pembayaran" || normalized === "menunggu_verifikasi";
  const isFailed = normalized === "ditolak" || normalized === "dibatalkan";

  let bgClass = "bg-gray-100 border-gray-200";
  let textClass = "text-gray-700";
  let label = status;

  if (isSuccess) {
    bgClass = "bg-emerald-100 border-emerald-300";
    textClass = "text-emerald-800";
    label = "Berhasil";
  } else if (isPending) {
    bgClass = "bg-amber-100 border-amber-300";
    textClass = "text-amber-800";
    label =
      normalized === "menunggu_verifikasi"
        ? "Menunggu Verifikasi"
        : "Menunggu Pembayaran";
  } else if (isFailed) {
    bgClass = "bg-red-100 border-red-300";
    textClass = "text-red-800";
    label = normalized === "ditolak" ? "Ditolak" : "Dibatalkan";
  }

  return (
    <View className={`rounded-full px-2.5 py-1 border ${bgClass}`}>
      <Text className={`text-[11px] font-bold ${textClass}`}>{label}</Text>
    </View>
  );
}

export default function SubscriptionHistoryScreen() {
  const { data, isLoading, refetch } = useSubscriptionHistory(1, 20);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const transactions = data?.items || [];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3.5">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
          >
            <Ionicons name="arrow-back" size={22} color="#15803d" />
          </Pressable>

          <Text className="text-base font-bold text-gray-900">
            Riwayat Transaksi Langganan
          </Text>

          <View className="h-10 w-10" />
        </View>

        <ScrollView
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {isLoading ? (
            <View className="py-16 items-center justify-center">
              <ActivityIndicator size="large" color="#15803d" />
              <Text className="text-xs text-gray-500 mt-2 font-medium">
                Memuat riwayat transaksi...
              </Text>
            </View>
          ) : transactions.length === 0 ? (
            <View className="py-16 items-center justify-center rounded-2xl bg-white border border-gray-200 p-6 mt-4">
              <View className="h-14 w-14 items-center justify-center rounded-full bg-gray-100 mb-3">
                <Ionicons name="receipt-outline" size={28} color="#9ca3af" />
              </View>
              <Text className="text-base font-bold text-gray-800 text-center">
                Belum Ada Riwayat Transaksi
              </Text>
              <Text className="text-xs text-gray-500 text-center mt-1 max-w-xs leading-relaxed">
                Anda belum pernah mengajukan atau membeli paket langganan.
              </Text>
              <Pressable
                onPress={() => router.push("/subscription" as never)}
                className="mt-5 rounded-xl bg-emerald-700 px-5 py-2.5 active:bg-emerald-800"
              >
                <Text className="text-xs font-bold text-white">
                  Beli Paket Langganan
                </Text>
              </Pressable>
            </View>
          ) : (
            transactions.map((item: TransaksiLangganan) => {
              const isManual = item.metode_pembayaran === "transfer_manual";
              const hasRejection =
                (item.status_pembayaran === "ditolak" ||
                  item.status_pembayaran === "dibatalkan") &&
                !!item.alasan_penolakan;

              return (
                <View
                  key={item.id_transaksi}
                  className="mb-4 rounded-2xl bg-white p-4 border border-gray-200 shadow-sm"
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-2">
                      <Text className="text-base font-bold text-gray-900">
                        {item.nama_paket}
                      </Text>
                      <Text className="text-xs text-gray-400 mt-0.5">
                        {formatTanggal(item.created_at)}
                      </Text>
                    </View>
                    <StatusBadge status={item.status_pembayaran} />
                  </View>

                  <View className="mt-3 pt-3 border-t border-gray-100 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1.5">
                      <View className="rounded-md bg-gray-100 px-2 py-0.5">
                        <Text className="text-[11px] font-semibold text-gray-600">
                          {isManual ? "Transfer Manual" : "Midtrans Online"}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-400">
                        • +{item.tambahan_hari} Hari
                      </Text>
                    </View>

                    <Text className="text-base font-extrabold text-emerald-800">
                      {formatRupiah(item.harga)}
                    </Text>
                  </View>

                  {/* Keterangan Penolakan jika ada */}
                  {hasRejection && (
                    <View className="mt-3 rounded-xl bg-red-50 p-3 border border-red-200">
                      <Text className="text-xs font-bold text-red-900">
                        Alasan Penolakan:
                      </Text>
                      <Text className="text-xs text-red-700 mt-0.5">
                        {item.alasan_penolakan}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
