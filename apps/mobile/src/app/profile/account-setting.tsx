import React from "react";
import { ScrollView, Text, TextInput, View, Pressable, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AccountHeader } from "@/component/profile/AccountHeader";
import { useAccountSettings } from "@/hooks/useAccountSetting";
import { AsyncStateView } from "@/component/ui/AsyncStateView";

export default function AccountSetting() {
  const {
    state,
    fullName,
    setFullName,
    phone,
    setPhone,
    email,
    setEmail,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isSaving,
    save,
  } = useAccountSettings();

  if (state.status === "loading") {
    return <AsyncStateView status="loading" />;
  }

  const handleSave = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert("Validasi", "Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    try {
      await save();
      Alert.alert("Sukses", "Perubahan profil berhasil disimpan.");
    } catch (err) {
      Alert.alert("Gagal", err instanceof Error ? err.message : "Gagal menyimpan perubahan.");
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <AccountHeader title="Account Settings" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <View className="mx-4">
          <Text className="mb-2 mt-4 font-bold text-sm text-slate-900">
            Informasi Profil
          </Text>

          <View className="rounded-2xl bg-white p-4 border border-slate-200">
            <InputField
              icon="person-outline"
              label="Nama Lengkap"
              value={fullName}
              onChangeText={setFullName}
            />

            <InputField
              icon="call-outline"
              label="Nomor WhatsApp / Telepon"
              value={phone}
              onChangeText={setPhone}
            />

            <InputField
              icon="mail-outline"
              label="Email"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text className="mb-2 mt-6 font-bold text-sm text-slate-900">
            Keamanan Akun
          </Text>

          <View className="rounded-2xl bg-white p-4 border border-slate-200">
            <InputField
              icon="lock-closed-outline"
              label="Kata Sandi Saat Ini"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secure
            />

            <InputField
              icon="key-outline"
              label="Kata Sandi Baru"
              value={newPassword}
              onChangeText={setNewPassword}
              secure
            />

            <InputField
              icon="checkmark-circle-outline"
              label="Konfirmasi Kata Sandi Baru"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secure
            />
          </View>

          <Pressable
            disabled={isSaving}
            className={`mt-6 rounded-xl bg-emerald-700 py-3.5 active:bg-emerald-800 ${
              isSaving ? "opacity-70" : ""
            }`}
            onPress={handleSave}
          >
            {isSaving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-center font-bold text-white text-sm">
                Simpan Perubahan
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function InputField({
  icon,
  label,
  value,
  onChangeText,
  secure = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secure?: boolean;
}) {
  return (
    <View className="mb-3.5">
      <Text className="mb-1.5 text-xs font-semibold text-slate-700">{label}</Text>

      <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
        <Ionicons name={icon} size={18} color="#64748B" />

        <TextInput
          className="ml-2.5 flex-1 py-2.5 text-sm text-slate-900"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          placeholder={label}
          placeholderTextColor="#94A3B8"
        />
      </View>
    </View>
  );
}
