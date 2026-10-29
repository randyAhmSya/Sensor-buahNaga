import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import { authService } from "@/service/authService";

const LOGO_IMG = require("@/assets/images/logo/logo.png");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Harap masukkan email dan kata sandi.");
      return;
    }

    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      setErrorMessage(
        "Format email tidak valid. Masukkan alamat email yang benar (contoh: nama@kebun.id)."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      console.log("[LoginScreen] Mencoba login dengan email:", trimmedEmail);
      await authService.login(trimmedEmail, password);

      // Redirect ke halaman dashboard utama
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const apiErr = err as {
        status?: number;
        data?: {
          pesan?: string;
          message?: string;
          errors?: Record<string, string[]>;
        };
        response?: {
          status?: number;
          data?: {
            pesan?: string;
            message?: string;
            errors?: Record<string, string[]>;
          };
        };
        originalError?: {
          response?: {
            data?: {
              pesan?: string;
              message?: string;
              errors?: Record<string, string[]>;
            };
          };
        };
        message?: string;
      };

      const errData =
        apiErr.data ||
        apiErr.response?.data ||
        apiErr.originalError?.response?.data;

      if (__DEV__) {
        console.warn("[LoginScreen Catch Warning]:", {
          status: apiErr.status || apiErr.response?.status,
          data: errData,
          message: apiErr.message,
        });
      }

      let serverMessage =
        errData?.pesan ||
        errData?.message ||
        apiErr.message ||
        "Gagal masuk ke sistem. Silakan periksa kredensial Anda.";

      if (errData?.errors) {
        const firstKey = Object.keys(errData.errors)[0];
        const fieldError = errData.errors[firstKey]?.[0];
        if (fieldError) {
          serverMessage = fieldError;
        }
      }

      setErrorMessage(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-slate-50"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1 px-6 py-10"
      >
        <View className="flex-1 justify-center max-w-md w-full self-center py-6">
          {/* Logo & Brand Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-3xl bg-white shadow-sm border border-emerald-100 items-center justify-center mb-4 p-2">
              <Image
                source={LOGO_IMG}
                className="w-16 h-16"
                resizeMode="contain"
                accessibilityLabel="Logo Smart Dragon Fruit Farm"
              />
            </View>
            <Text className="text-2xl font-bold text-slate-800 tracking-tight text-center">
              Selamat Datang Kembali
            </Text>
            <Text className="text-sm text-slate-500 text-center mt-1 px-4">
              Masuk untuk memantau kebun dan sistem IoT buah naga Anda secara realtime
            </Text>
          </View>

          {/* Inline Error Banner */}
          {errorMessage ? (
            <View className="mb-5 flex-row items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-3.5">
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text className="flex-1 text-xs text-red-700 font-medium">
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Form Card */}
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 gap-5">
            {/* Input Email */}
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Alamat Email
              </Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:border-emerald-600">
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="#64748B"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="nama@kebun.id"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting}
                  className="flex-1 text-sm text-slate-800 p-0"
                />
              </View>
            </View>

            {/* Input Password */}
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Kata Sandi
              </Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:border-emerald-600">
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#64748B"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isSubmitting}
                  className="flex-1 text-sm text-slate-800 p-0"
                />
                <PressableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  accessibilityLabel={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                  className="p-1"
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </PressableOpacity>
              </View>
            </View>

            {/* Remember Me & Forgot Password */}
            <View className="flex-row items-center justify-between pt-1">
              <PressableOpacity
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
                className="flex-row items-center gap-2"
                accessibilityLabel="Ingat saya toggle"
              >
                <View
                  className={`w-5 h-5 rounded-md border items-center justify-center ${
                    rememberMe
                      ? "bg-emerald-700 border-emerald-700"
                      : "bg-white border-slate-300"
                  }`}
                >
                  {rememberMe && (
                    <Ionicons name="checkmark" size={14} color="#ffffff" />
                  )}
                </View>
                <Text className="text-xs text-slate-600 select-none">
                  Ingat Saya
                </Text>
              </PressableOpacity>

              <PressableOpacity
                onPress={() => {
                  setErrorMessage(
                    "Silakan hubungi administrator kebun untuk mereset kata sandi."
                  );
                }}
                activeOpacity={0.7}
              >
                <Text className="text-xs font-semibold text-emerald-700">
                  Lupa Sandi?
                </Text>
              </PressableOpacity>
            </View>

            {/* Submit Button */}
            <PressableOpacity
              onPress={handleLogin}
              disabled={isSubmitting}
              activeOpacity={0.85}
              className={`flex-row items-center justify-center rounded-2xl py-3.5 mt-2 shadow-sm ${
                isSubmitting ? "bg-slate-400" : "bg-emerald-700"
              }`}
              accessibilityRole="button"
              accessibilityLabel="Masuk ke Sistem"
            >
              {isSubmitting ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text className="text-sm font-semibold text-white">
                    Memproses...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-semibold text-white">
                    Masuk ke Sistem
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                </View>
              )}
            </PressableOpacity>
          </View>

          {/* Footer Info */}
          <View className="mt-8 items-center gap-2">
            <Text className="text-xs text-slate-600 text-center">
              Belum memiliki akun atau butuh akses node baru?
            </Text>
            <Text className="text-xs font-semibold text-slate-600 text-center">
              Hubungi Administrator Kebun atau Dinas Terkait
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
