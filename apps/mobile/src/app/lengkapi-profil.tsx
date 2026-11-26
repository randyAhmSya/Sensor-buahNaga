import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import { authService } from "@/service/authService";
import { useAuthState } from "@/service/authStorage";

const POLA_HP = /^(\+62|62|0)8[0-9]{7,12}$/;

/** Wajib diisi akun baru hasil login Google sebelum masuk dasbor. */
export default function LengkapiProfilScreen() {
  const { user } = useAuthState();
  const [namaKebun, setNamaKebun] = useState("");
  const [noHp, setNoHp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSimpan = async () => {
    const hp = noHp.replace(/[\s-]/g, "");
    if (!namaKebun.trim()) {
      setErrorMessage("Nama kebun wajib diisi.");
      return;
    }
    if (!POLA_HP.test(hp)) {
      setErrorMessage("Nomor HP tidak valid. Contoh: 081234567890");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await authService.lengkapiProfil(namaKebun, hp);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const apiErr = err as {
        data?: {
          pesan?: string;
          message?: string;
          errors?: Record<string, string[]>;
        };
        message?: string;
      };
      const pertama = apiErr.data?.errors
        ? Object.values(apiErr.data.errors)[0]?.[0]
        : undefined;
      setErrorMessage(
        pertama ||
          apiErr.data?.pesan ||
          apiErr.message ||
          "Gagal menyimpan profil. Coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeluar = async () => {
    await authService.logout();
    router.replace("/login");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-slate-50"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        className="flex-1 px-6 py-10"
      >
        <View className="flex-1 justify-center max-w-md w-full self-center py-6">
          <Text className="text-2xl font-bold text-slate-800 tracking-tight">
            Satu langkah lagi
          </Text>
          <Text className="text-sm text-slate-500 mt-1 mb-6">
            Halo{user?.nama_lengkap ? `, ${user.nama_lengkap}` : ""}. Lengkapi
            data berikut sebelum mulai memakai AgroLight.
          </Text>

          {errorMessage ? (
            <View className="mb-5 flex-row items-center gap-3 bg-white border-[1.5px] border-rose-600 rounded-lg p-3.5">
              <Ionicons name="alert-circle" size={20} color="#DC2626" />
              <Text className="flex-1 text-xs text-red-700 font-medium">
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <View className="bg-white rounded-lg p-6 shadow-sm border border-slate-200 gap-5">
            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Nama Kebun / Usaha
              </Text>
              <View className="flex-row items-center bg-white border-[1.5px] border-slate-400 rounded-lg px-4 py-3 focus:border-emerald-600">
                <Ionicons
                  name="leaf-outline"
                  size={18}
                  color="#64748B"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  value={namaKebun}
                  onChangeText={(v) => {
                    setNamaKebun(v);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="mis. Kebun Naga Sejahtera"
                  placeholderTextColor="#94A3B8"
                  editable={!isSubmitting}
                  className="flex-1 text-sm text-slate-800 p-0"
                />
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Nomor HP
              </Text>
              <View className="flex-row items-center bg-white border-[1.5px] border-slate-400 rounded-lg px-4 py-3 focus:border-emerald-600">
                <Ionicons
                  name="call-outline"
                  size={18}
                  color="#64748B"
                  style={{ marginRight: 10 }}
                />
                <TextInput
                  value={noHp}
                  onChangeText={(v) => {
                    setNoHp(v.replace(/[^\d+]/g, ""));
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="081234567890"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  editable={!isSubmitting}
                  className="flex-1 text-sm text-slate-800 p-0"
                />
              </View>
            </View>

            <PressableOpacity
              onPress={handleSimpan}
              disabled={isSubmitting}
              activeOpacity={0.85}
              className={`flex-row items-center justify-center rounded-lg py-3.5 shadow-sm ${
                isSubmitting ? "bg-slate-400" : "bg-emerald-700"
              }`}
              accessibilityRole="button"
              accessibilityLabel="Simpan dan lanjutkan"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-sm font-semibold text-white">
                  Simpan dan Lanjutkan
                </Text>
              )}
            </PressableOpacity>
          </View>

          <PressableOpacity
            onPress={handleKeluar}
            activeOpacity={0.7}
            className="mt-6 items-center"
          >
            <Text className="text-xs font-semibold text-slate-500">
              Keluar dan pakai akun lain
            </Text>
          </PressableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
