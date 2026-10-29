import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (__DEV__) {
      console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="alert-circle-outline" size={32} color="#dc2626" />
            </View>

            <Text style={styles.title}>Terjadi Kendala Teknis</Text>

            <Text style={styles.subtitle}>
              Aplikasi mengalami kendala tak terduga. Silakan coba muat ulang komponen ini.
            </Text>

            {__DEV__ && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugHeader}>[DEV ERROR REPORT]</Text>
                <ScrollView
                  style={styles.debugScroll}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                >
                  <Text style={styles.debugText}>
                    {this.state.error.name}: {this.state.error.message}
                  </Text>
                  {this.state.error.stack ? (
                    <Text style={styles.debugStack}>
                      {this.state.error.stack}
                    </Text>
                  ) : null}
                </ScrollView>
              </View>
            )}

            <Pressable
              onPress={this.handleReset}
              accessibilityRole="button"
              accessibilityLabel="Coba Lagi"
              style={({ pressed }) => [
                styles.retryButton,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color="#ffffff"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Coba Lagi</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  debugContainer: {
    width: "100%",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  debugHeader: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "#dc2626",
    fontWeight: "700",
    marginBottom: 6,
  },
  debugScroll: {
    maxHeight: 120,
  },
  debugText: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#1f2937",
    marginBottom: 4,
  },
  debugStack: {
    fontSize: 10,
    fontFamily: "monospace",
    color: "#6b7280",
    lineHeight: 14,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: "#15803d",
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
});
