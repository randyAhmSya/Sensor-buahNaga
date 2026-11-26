import React, { useEffect } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { router } from "expo-router";

/**
 * Tujuan deep link agrolight://auth/google?kode=... dari backend.
 * Hasil login dibaca oleh WebBrowser.openAuthSessionAsync di authService.loginDenganGoogle()
 * (layar Login masih menunggu hasilnya), jadi layar ini hanya mencegah "rute tidak ditemukan"
 * lalu langsung kembali ke layar sebelumnya.
 */
export default function GoogleCallbackScreen() {
  useEffect(() => {
    const t = setTimeout(() => {
      if (router.canGoBack()) router.back();
      else router.replace("/login");
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-slate-50 gap-3">
      <ActivityIndicator size="large" color="#047857" />
      <Text className="text-sm text-slate-500">
        Menyelesaikan login Google...
      </Text>
    </View>
  );
}
