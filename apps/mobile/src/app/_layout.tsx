import React, { useEffect, useRef } from "react";
import { Alert, AppState, type AppStateStatus, Platform } from "react-native";
import { Stack, router } from "expo-router";
import "../css/global.css";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { focusManager, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import * as SplashScreen from "expo-splash-screen";
import NetInfo from "@react-native-community/netinfo";
import { queryClient, asyncStoragePersister } from "@/lib/queryClient";
import { ErrorBoundary } from "@/component/ui/ErrorBoundary";
import { onSubscriptionRequired } from "@/service/apiClient";
import { FITUR_LANGGANAN } from "@/config/features";

// Tahan splash screen sampai inisialisasi awal siap
SplashScreen.preventAutoHideAsync().catch(() => {});

// Hubungkan TanStack Query dengan status koneksi jaringan fisik
onlineManager.setEventListener((setOnline) => {
  try {
    return NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected && state.isInternetReachable !== false);
    });
  } catch (err) {
    if (__DEV__) {
      console.warn("[onlineManager] Fallback mode untuk NetInfo:", err);
    }
    setOnline(true);
    return () => {};
  }
});

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

function SubscriptionAlertWatcher({ children }: { children: React.ReactNode }) {
  const isAlertShown = useRef(false);

  useEffect(() => {
    const unsubscribe = onSubscriptionRequired((message) => {
      if (isAlertShown.current) return;
      isAlertShown.current = true;

      if (!FITUR_LANGGANAN) {
        Alert.alert(
          "Akses Tidak Tersedia",
          "Akses sementara tidak tersedia, coba lagi nanti.",
          [
            {
              text: "Tutup",
              style: "default",
              onPress: () => {
                isAlertShown.current = false;
              },
            },
          ]
        );
        return;
      }

      Alert.alert(
        "Langganan Kadaluarsa",
        message ||
          "Masa aktif langganan kebun Anda telah habis. Silakan perpanjang paket untuk melanjutkan akses kontrol dan telemetri perangkat.",
        [
          {
            text: "Beli Paket",
            onPress: () => {
              isAlertShown.current = false;
              router.push("/subscription" as never);
            },
          },
          {
            text: "Nanti",
            style: "cancel",
            onPress: () => {
              isAlertShown.current = false;
            },
          },
        ],
      );
    });

    return unsubscribe;
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  useEffect(() => {
    const appStateSub = AppState.addEventListener("change", onAppStateChange);

    // Sembunyikan splash screen dengan mulus setelah bootstrap selesai
    const splashTimer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 150);

    return () => {
      appStateSub.remove();
      clearTimeout(splashTimer);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: asyncStoragePersister,
          maxAge: 1000 * 60 * 60 * 24, // 24 jam
          dehydrateOptions: {
            shouldDehydrateQuery: (query) => {
              const queryKey = query.queryKey[0];
              if (queryKey === "auth" || queryKey === "token") return false;
              return query.state.status === "success";
            },
          },
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ErrorBoundary>
            <SubscriptionAlertWatcher>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="login" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="scan" options={{ presentation: "modal" }} />
                <Stack.Screen name="subscription" />
              </Stack>
            </SubscriptionAlertWatcher>
          </ErrorBoundary>
        </SafeAreaView>
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
