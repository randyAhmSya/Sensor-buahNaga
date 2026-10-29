import React, { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { Stack, router } from "expo-router";
import "../css/global.css";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/component/ui/ErrorBoundary";
import { onSubscriptionRequired } from "@/service/apiClient";

function SubscriptionAlertWatcher({ children }: { children: React.ReactNode }) {
  const isAlertShown = useRef(false);

  useEffect(() => {
    const unsubscribe = onSubscriptionRequired((message) => {
      if (isAlertShown.current) return;
      isAlertShown.current = true;

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
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
