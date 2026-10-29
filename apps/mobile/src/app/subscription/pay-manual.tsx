import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useBuyManualMutation } from "@/hooks/useSubscription";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PayManualScreen() {
  const { paketId, namaPaket, harga, tambahanHari } = useLocalSearchParams<{
    paketId: string;
    namaPaket: string;
    harga: string;
    tambahanHari: string;
  }>();

  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const buyManualMutation = useBuyManualMutation();

  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Akses Galeri",
          "Aplikasi membutuhkan izin galeri untuk mengunggah bukti transfer.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch {
      Alert.alert("Gagal", "Tidak dapat membuka galeri.");
    }
  };

  const handleSubmit = async () => {
    if (!paketId) {
      Alert.alert("Error", "ID paket tidak valid.");
      return;
    }

    if (!selectedImage) {
      Alert.alert(
        "Bukti Transfer Diperlukan",
        "Silakan pilih foto struk atau tangkapan layar bukti transfer terlebih dahulu.",
      );
      return;
    }

    try {
      const fileUri = selectedImage.uri;
      const fileName =
        selectedImage.fileName ||
        `bukti_transfer_${Date.now()}.${
          selectedImage.mimeType?.split("/")[1] || "jpg"
        }`;
      const mimeType = selectedImage.mimeType || "image/jpeg";

      await buyManualMutation.mutateAsync({
        paketId,
        fileUri,
        fileName,
        mimeType,
      });

      Alert.alert(
        "Pengajuan Berhasil",
        "Bukti transfer Anda telah dikirim dan sedang menunggu verifikasi admin. Layanan akan aktif setelah diverifikasi.",
        [
          {
            text: "Lihat Riwayat",
            onPress: () => router.replace("/subscription/history" as never),
          },
        ],
      );
    } catch (err: unknown) {
      const error = err as { message?: string };
      Alert.alert(
        "Gagal Mengirim",
        error.message || "Terjadi kesalahan saat mengunggah bukti transfer.",
      );
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
            Transfer Manual
          </Text>

          <View className="h-10 w-10" />
        </View>

        <ScrollView
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {/* Ringkasan Paket */}
          <View className="mb-4 rounded-2xl bg-white p-5 border border-gray-200 shadow-sm">
            <Text className="text-xs font-semibold text-gray-500 uppercase">
              Paket Langganan
            </Text>
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">
                {namaPaket || "Paket Langganan"}
              </Text>
              <Text className="text-sm font-extrabold text-emerald-700">
                +{tambahanHari} Hari
              </Text>
            </View>
            <Text className="mt-2 text-2xl font-black text-gray-900">
              {formatRupiah(parsedHarga)}
            </Text>
          </View>

          {/* Rekening Tujuan */}
          <View className="mb-4 rounded-2xl bg-emerald-50/60 p-5 border border-emerald-200">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="business-outline" size={20} color="#15803d" />
              <Text className="text-sm font-bold text-emerald-950">
                Rekening Pembayaran Resmi AgroLight
              </Text>
            </View>

            <View className="rounded-xl bg-white p-3.5 border border-emerald-100 mb-2">
              <Text className="text-xs text-gray-500">Bank Mandiri</Text>
              <Text className="text-base font-extrabold text-gray-900 tracking-wider">
                142-00-1987654-3
              </Text>
              <Text className="text-xs font-semibold text-emerald-800 mt-0.5">
                a.n. PT Agro Light Teknologi
              </Text>
            </View>

            <View className="rounded-xl bg-white p-3.5 border border-emerald-100">
              <Text className="text-xs text-gray-500">Bank BCA</Text>
              <Text className="text-base font-extrabold text-gray-900 tracking-wider">
                873-556-9120
              </Text>
              <Text className="text-xs font-semibold text-emerald-800 mt-0.5">
                a.n. PT Agro Light Teknologi
              </Text>
            </View>

            <Text className="text-[11px] text-emerald-900 mt-3 leading-relaxed">
              *Pastikan nominal transfer tepat hingga digit terakhir agar proses verifikasi admin berjalan cepat.
            </Text>
          </View>

          {/* Upload Bukti Transfer */}
          <View className="mb-6 rounded-2xl bg-white p-5 border border-gray-200 shadow-sm">
            <Text className="text-sm font-bold text-gray-900 mb-1">
              Unggah Bukti Transfer
            </Text>
            <Text className="text-xs text-gray-500 mb-4">
              Format JPG, PNG, atau WEBP maks 5 MB.
            </Text>

            {selectedImage ? (
              <View className="rounded-2xl border border-gray-200 p-3 bg-gray-50 items-center">
                <Image
                  source={{ uri: selectedImage.uri }}
                  className="h-64 w-full rounded-xl bg-gray-200"
                  resizeMode="contain"
                />
                <View className="mt-3 flex-row gap-2 w-full">
                  <Pressable
                    onPress={handlePickImage}
                    className="flex-1 rounded-xl bg-gray-200 py-2.5 items-center active:bg-gray-300"
                  >
                    <Text className="text-xs font-bold text-gray-800">
                      Ganti Foto
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setSelectedImage(null)}
                    className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 items-center active:bg-red-100"
                  >
                    <Ionicons name="trash-outline" size={16} color="#b91c1c" />
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={handlePickImage}
                className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/30 p-8 items-center justify-center active:bg-emerald-50"
              >
                <View className="h-12 w-12 rounded-full bg-emerald-100 items-center justify-center mb-2">
                  <Ionicons name="cloud-upload-outline" size={26} color="#15803d" />
                </View>
                <Text className="text-sm font-bold text-emerald-900">
                  Pilih Foto dari Galeri
                </Text>
                <Text className="text-xs text-gray-500 mt-1">
                  Ambil screenshot atau foto struk ATM
                </Text>
              </Pressable>
            )}
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={buyManualMutation.isPending}
            className={`rounded-2xl py-4 items-center ${
              buyManualMutation.isPending
                ? "bg-emerald-400"
                : "bg-emerald-700 active:bg-emerald-800"
            }`}
          >
            {buyManualMutation.isPending ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-sm font-bold text-white">
                  Mengunggah Bukti Pembayaran...
                </Text>
              </View>
            ) : (
              <Text className="text-base font-bold text-white">
                Kirim Pengajuan Langganan
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
