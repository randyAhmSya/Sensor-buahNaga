import React, { useEffect, useRef } from "react";
import { Alert, AppState, type AppStateStatus, Platform } from "react-native";
import { Stack, router, useSegments } from "expo-router";
import "../css/global.css";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { focusManager, onlineManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import * as SplashScreen from "expo-splash-screen";
import NetInfo from "@react-native-community/netinfo";
import { queryClient, asyncStoragePersister, clearAppCache } from "@/lib/queryClient";
import { ErrorBoundary } from "@/component/ui/ErrorBoundary";
import { onSubscriptionRequired, onAuthRequired } from "@/service/apiClient";
import { useAuthState } from "@/service/authStorage";
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

function AuthNavigationWatcher({
  isInitialized,
  isAuthenticated,
}: {
  isInitialized: boolean;
  isAuthenticated: boolean;
}) {
  const segments = useSegments();
  const isHandling401 = useRef(false);

  // 1. Guard rute berdasarkan status autentikasi reaktif
  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "login";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isInitialized, isAuthenticated, segments]);

  // 2. Tangani 401 unauthenticated listener dari apiClient (cegah loop / ganda)
  useEffect(() => {
    const unsubscribe = onAuthRequired(() => {
      if (isHandling401.current) return;
      isHandling401.current = true;
      clearAppCache().finally(() => {
        router.replace("/login");
        setTimeout(() => {
          isHandling401.current = false;
        }, 1500);
      });
    });
    return unsubscribe;
  }, []);

  return null;
}

export default function RootLayout() {
  const { isInitialized, isAuthenticated } = useAuthState();

  useEffect(() => {
    const appStateSub = AppState.addEventListener("change", onAppStateChange);
    return () => {
      appStateSub.remove();
    };
  }, []);

  // Sembunyikan splash screen hanya setelah authStorage.init() benar-benar selesai
  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isInitialized]);

  // Tahan rendering navigator sampai bootstrap storage selesai
  if (!isInitialized) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister: asyncStoragePersister,
          buster: "v2",
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
              <AuthNavigationWatcher
                isInitialized={isInitialized}
                isAuthenticated={isAuthenticated}
              />
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
