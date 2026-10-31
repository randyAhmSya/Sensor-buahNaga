import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams, router, Redirect } from "expo-router";
import { FITUR_LANGGANAN } from "@/config/features";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useBuyOnlineMutation } from "@/hooks/useSubscription";
import { subscriptionService } from "@/service/subscriptionService";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function PayOnlineScreenInner() {
  const { paketId, namaPaket, harga, tambahanHari } = useLocalSearchParams<{
    paketId: string;
    namaPaket: string;
    harga: string;
    tambahanHari: string;
  }>();

  const buyOnlineMutation = useBuyOnlineMutation();
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [isOpeningBrowser, setIsOpeningBrowser] = useState(false);

  const handleStartPayment = async () => {
    if (!paketId) {
      Alert.alert("Error", "ID paket tidak valid.");
      return;
    }

    try {
      setIsOpeningBrowser(true);
      const res = await buyOnlineMutation.mutateAsync({ paketId });
      setSnapToken(res.snap_token);

      const snapUrl = subscriptionService.getSnapPaymentUrl(res.snap_token);

      // Buka halaman pembayaran Snap Midtrans di browser aman in-app
      const browserResult = await WebBrowser.openBrowserAsync(snapUrl);

      // Setelah user menutup popup browser, arahkan ke riwayat transaksi
      Alert.alert(
        "Selesai Membayar?",
        "Silakan periksa riwayat pembayaran untuk memastikan status transaksi Midtrans Anda telah terkonfirmasi.",
        [
          {
            text: "Cek Riwayat",
            onPress: () => router.replace("/subscription/history" as never),
          },
          {
            text: "Kembali",
            style: "cancel",
          },
        ],
      );
    } catch (err: unknown) {
      const error = err as { message?: string };
      // Fallback jika browser in-app bermasalah
      if (snapToken) {
        const snapUrl = subscriptionService.getSnapPaymentUrl(snapToken);
        Linking.openURL(snapUrl).catch(() => {});
      } else {
        Alert.alert(
          "Gagal Membuat Pembayaran",
          error.message || "Gagal menghubungkan ke payment gateway Midtrans.",
        );
      }
    } finally {
      setIsOpeningBrowser(false);
    }
  };

  const parsedHarga = Number(harga) || 0;

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
            Pembayaran Online Midtrans
          </Text>

          <View className="h-10 w-10" />
        </View>

        <ScrollView
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {/* Ringkasan Pesanan */}
          <View className="mb-4 rounded-2xl bg-white p-5 border border-gray-200 shadow-sm">
            <Text className="text-xs font-semibold text-gray-500 uppercase">
              Ringkasan Pesanan
            </Text>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">
                {namaPaket || "Paket Langganan"}
              </Text>
              <View className="rounded-full bg-emerald-50 px-2.5 py-0.5 border border-emerald-200">
                <Text className="text-xs font-bold text-emerald-800">
                  +{tambahanHari} Hari
                </Text>
              </View>
            </View>

            <View className="mt-4 pt-4 border-t border-gray-100 flex-row items-baseline justify-between">
              <Text className="text-sm text-gray-500">Total Pembayaran</Text>
              <Text className="text-2xl font-black text-emerald-700">
                {formatRupiah(parsedHarga)}
              </Text>
            </View>
          </View>

          {/* Metode yang didukung Midtrans */}
          <View className="mb-6 rounded-2xl bg-white p-5 border border-gray-200 shadow-sm">
            <Text className="text-sm font-bold text-gray-900 mb-1">
              Metode Pembayaran Tersedia
            </Text>
            <Text className="text-xs text-gray-500 mb-4 leading-relaxed">
              Transaksi diproses otomatis secara instan oleh Midtrans Snap:
            </Text>

            <View className="gap-3">
              <View className="flex-row items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <View className="h-9 w-9 rounded-lg bg-emerald-100 items-center justify-center">
                  <Ionicons name="qr-code-outline" size={20} color="#15803d" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-gray-900">
                    QRIS (BCA, GoPay, OVO, ShopeePay, Dana)
                  </Text>
                  <Text className="text-[11px] text-gray-400">
                    Scan kode QR langsung dari aplikasi e-wallet / m-banking Anda
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <View className="h-9 w-9 rounded-lg bg-emerald-100 items-center justify-center">
                  <Ionicons name="card-outline" size={20} color="#15803d" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-gray-900">
                    Virtual Account (BCA, Mandiri, BNI, BRI, Permata)
                  </Text>
                  <Text className="text-[11px] text-gray-400">
                    Nomor VA otomatis terbit dengan konfirmasi instan
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <View className="h-9 w-9 rounded-lg bg-emerald-100 items-center justify-center">
                  <Ionicons name="storefront-outline" size={20} color="#15803d" />
                </View>
                <View>
                  <Text className="text-xs font-bold text-gray-900">
                    Convenience Store (Indomaret / Alfamart)
                  </Text>
                  <Text className="text-[11px] text-gray-400">
                    Bayar tunai di gerai terdekat dengan kode pembayaran
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <Pressable
            onPress={handleStartPayment}
            disabled={buyOnlineMutation.isPending || isOpeningBrowser}
            className={`rounded-2xl py-4 items-center ${
              buyOnlineMutation.isPending || isOpeningBrowser
                ? "bg-emerald-400"
                : "bg-emerald-700 active:bg-emerald-800"
            }`}
          >
            {buyOnlineMutation.isPending || isOpeningBrowser ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-sm font-bold text-white">
                  Menyiapkan Pembayaran Midtrans...
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-2">
                <Ionicons name="lock-closed" size={16} color="#ffffff" />
                <Text className="text-base font-bold text-white">
                  Bayar Sekarang via Midtrans
                </Text>
              </View>
            )}
          </Pressable>

          <Text className="mt-3 text-center text-xs text-gray-400">
            Enkripsi pembayaran aman 256-bit standar industri perbankan
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

export default function PayOnlineScreen() {
  if (!FITUR_LANGGANAN) {
    return <Redirect href="/(tabs)" />;
  }
  return <PayOnlineScreenInner />;
}
