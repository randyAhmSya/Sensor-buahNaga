import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Stack, router, Redirect } from "expo-router";
import { FITUR_LANGGANAN } from "@/config/features";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useSubscriptionStatus,
  useSubscriptionPackages,
} from "@/hooks/useSubscription";
import type { PaketLangganan } from "@/types/subscription";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function SubscriptionIndexScreenInner() {
  const {
    data: statusData,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useSubscriptionStatus();

  const {
    data: packages = [],
    isLoading: packagesLoading,
    refetch: refetchPackages,
  } = useSubscriptionPackages();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPaket, setSelectedPaket] = useState<PaketLangganan | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStatus(), refetchPackages()]);
    setRefreshing(false);
  }, [refetchStatus, refetchPackages]);

  const handleSelectPackage = (paket: PaketLangganan) => {
    setSelectedPaket(paket);
    setModalVisible(true);
  };

  const handleChooseManual = () => {
    if (!selectedPaket) return;
    setModalVisible(false);
    router.push({
      pathname: "/subscription/pay-manual" as never,
      params: {
        paketId: selectedPaket.id_paket,
        namaPaket: selectedPaket.nama_paket,
        harga: selectedPaket.harga.toString(),
        tambahanHari: selectedPaket.tambahan_hari.toString(),
      },
    });
  };

  const handleChooseOnline = () => {
    if (!selectedPaket) return;
    setModalVisible(false);
    router.push({
      pathname: "/subscription/pay-online" as never,
      params: {
        paketId: selectedPaket.id_paket,
        namaPaket: selectedPaket.nama_paket,
        harga: selectedPaket.harga.toString(),
        tambahanHari: selectedPaket.tambahan_hari.toString(),
      },
    });
  };

  const status = statusData?.status_langganan || "kadaluarsa";
  const sisaHari = statusData?.sisa_hari ?? 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3.5">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
            accessibilityLabel="Kembali"
          >
            <Ionicons name="arrow-back" size={22} color="#15803d" />
          </Pressable>

          <Text className="text-base font-bold text-gray-900">
            Langganan & Paket
          </Text>

          <Pressable
            onPress={() => router.push("/subscription/history" as never)}
            className="flex-row items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 border border-emerald-200 active:bg-emerald-100"
            accessibilityLabel="Riwayat Pembayaran"
          >
            <Ionicons name="receipt-outline" size={16} color="#15803d" />
            <Text className="text-xs font-bold text-emerald-800">Riwayat</Text>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Card Status Langganan Saat Ini */}
          <View className="mb-6 rounded-2xl bg-white p-5 border border-gray-200 shadow-sm">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                  <Ionicons name="shield-checkmark" size={20} color="#15803d" />
                </View>
                <Text className="text-sm font-bold text-gray-800">
                  Status Langganan Kebun
                </Text>
              </View>

              {statusLoading ? (
                <ActivityIndicator size="small" color="#15803d" />
              ) : (
                <View
                  className={`rounded-full px-3 py-1 ${
                    status === "aktif"
                      ? "bg-emerald-100 border border-emerald-300"
                      : status === "dalam_masa_tenggang"
                      ? "bg-amber-100 border border-amber-300"
                      : "bg-red-100 border border-red-300"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      status === "aktif"
                        ? "text-emerald-800"
                        : status === "dalam_masa_tenggang"
                        ? "text-amber-800"
                        : "text-red-800"
                    }`}
                  >
                    {status === "aktif"
                      ? "Aktif"
                      : status === "dalam_masa_tenggang"
                      ? "Masa Tenggang"
                      : "Kadaluarsa"}
                  </Text>
                </View>
              )}
            </View>

            <View className="mt-4 pt-4 border-t border-gray-100">
              {status === "aktif" ? (
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-3xl font-extrabold text-emerald-700">
                    {sisaHari}
                  </Text>
                  <Text className="text-sm font-semibold text-gray-600">
                    Hari Aktif Tersisa
                  </Text>
                </View>
              ) : status === "dalam_masa_tenggang" ? (
                <View>
                  <Text className="text-base font-bold text-amber-800">
                    Dalam Masa Tenggang ({sisaHari} Hari)
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    Segera perpanjang paket agar kontrol otomatis dan sensor tidak terhenti.
                  </Text>
                </View>
              ) : (
                <View>
                  <Text className="text-base font-bold text-red-700">
                    Masa Langganan Telah Habis
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    Silakan beli paket langganan untuk mengaktifkan kembali kontrol perangkat kebun.
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Katalog Paket */}
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-extrabold text-gray-900">
              Pilihan Paket Langganan
            </Text>
            <Text className="text-xs text-gray-500">
              Pilih paket sesuai kebutuhan kebun
            </Text>
          </View>

          {packagesLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color="#15803d" />
              <Text className="text-xs text-gray-500 mt-2">
                Memuat katalog paket...
              </Text>
            </View>
          ) : packages.length === 0 ? (
            <View className="py-10 items-center justify-center rounded-2xl bg-white border border-gray-200">
              <Ionicons name="cube-outline" size={44} color="#9ca3af" />
              <Text className="text-sm font-bold text-gray-700 mt-2">
                Belum Ada Paket Tersedia
              </Text>
              <Text className="text-xs text-gray-400 mt-0.5">
                Katalog paket langganan sedang diperbarui oleh sistem.
              </Text>
            </View>
          ) : (
            packages.map((pkg) => (
              <View
                key={pkg.id_paket}
                className="mb-4 rounded-2xl bg-white p-5 border border-emerald-100 shadow-sm"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-bold text-gray-900">
                    {pkg.nama_paket}
                  </Text>
                  <View className="rounded-full bg-emerald-50 px-3 py-1 border border-emerald-200">
                    <Text className="text-xs font-bold text-emerald-800">
                      +{pkg.tambahan_hari} Hari
                    </Text>
                  </View>
                </View>

                <Text className="mt-2 text-2xl font-black text-emerald-700">
                  {formatRupiah(pkg.harga)}
                </Text>

                {pkg.deskripsi && (
                  <Text className="mt-1 text-xs text-gray-500 leading-relaxed">
                    {pkg.deskripsi}
                  </Text>
                )}

                <View className="mt-4 gap-2 border-t border-gray-100 pt-3">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={16} color="#15803d" />
                    <Text className="text-xs text-gray-600">
                      Monitoring sensor & telemetri kebun real-time
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={16} color="#15803d" />
                    <Text className="text-xs text-gray-600">
                      Auto-dimming pintar & jadwal lampu otomatis
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="checkmark-circle" size={16} color="#15803d" />
                    <Text className="text-xs text-gray-600">
                      Pelacakan siklus pembungaan hingga panen
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => handleSelectPackage(pkg)}
                  className="mt-4 rounded-xl bg-emerald-700 py-3 items-center active:bg-emerald-800"
                >
                  <Text className="text-sm font-bold text-white">
                    Pilih Paket Ini
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </ScrollView>

        {/* Modal Pemilihan Metode Pembayaran */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6 border-t border-gray-200">
              <View className="flex-row items-center justify-between pb-3 border-b border-gray-100">
                <Text className="text-lg font-bold text-gray-900">
                  Pilih Metode Pembayaran
                </Text>
                <Pressable
                  onPress={() => setModalVisible(false)}
                  className="p-1 rounded-full bg-gray-100"
                >
                  <Ionicons name="close" size={20} color="#4b5563" />
                </Pressable>
              </View>

              {selectedPaket && (
                <View className="my-4 rounded-xl bg-gray-50 p-3.5 border border-gray-200">
                  <Text className="text-xs text-gray-500">Paket Terpilih</Text>
                  <Text className="text-base font-bold text-gray-900">
                    {selectedPaket.nama_paket} (+{selectedPaket.tambahan_hari} Hari)
                  </Text>
                  <Text className="text-sm font-extrabold text-emerald-700 mt-0.5">
                    {formatRupiah(selectedPaket.harga)}
                  </Text>
                </View>
              )}

              <View className="gap-3">
                {/* Opsi 1: Midtrans Online */}
                <Pressable
                  onPress={handleChooseOnline}
                  className="flex-row items-center justify-between rounded-lg border border-emerald-300 bg-white p-4 active:bg-emerald-50"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 rounded-xl bg-emerald-700 items-center justify-center">
                      <Ionicons name="card-outline" size={22} color="#ffffff" />
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-gray-900">
                        Pembayaran Online (Midtrans)
                      </Text>
                      <Text className="text-xs text-gray-500">
                        QRIS, GoPay, ShopeePay, Virtual Account (Instan)
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#15803d" />
                </Pressable>

                {/* Opsi 2: Transfer Manual */}
                <Pressable
                  onPress={handleChooseManual}
                  className="flex-row items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-100"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 rounded-xl bg-gray-100 items-center justify-center">
                      <Ionicons name="document-text-outline" size={22} color="#374151" />
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-gray-900">
                        Transfer Bank Manual
                      </Text>
                      <Text className="text-xs text-gray-500">
                        Upload foto bukti transfer (Verifikasi Admin)
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}

export default function SubscriptionIndexScreen() {
  if (!FITUR_LANGGANAN) {
    return <Redirect href="/(tabs)" />;
  }
  return <SubscriptionIndexScreenInner />;
}
