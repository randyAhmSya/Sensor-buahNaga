import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme/tokens";
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
    tenantName,
    setTenantName,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isSaving,
    isChangingPassword,
    saveProfile,
    savePassword,
  } = useAccountSettings();

  if (state.status === "loading") {
    return <AsyncStateView status="loading" />;
  }

  if (state.status === "error") {
    return (
      <View className="flex-1 bg-slate-50">
        <AccountHeader title="Account Settings" />
        <AsyncStateView status="error" errorMessage={state.message} />
      </View>
    );
  }

  const handleSaveProfile = async () => {
    try {
      await saveProfile();
      Alert.alert("Sukses", "Profil berhasil disimpan.");
    } catch (err) {
      Alert.alert(
        "Gagal",
        err instanceof Error ? err.message : "Gagal menyimpan profil.",
      );
    }
  };

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert("Validasi", "Isi kata sandi saat ini dan kata sandi baru.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Validasi", "Konfirmasi kata sandi baru tidak cocok.");
      return;
    }
    try {
      await savePassword();
      Alert.alert(
        "Sukses",
        "Kata sandi diperbarui. Perangkat lain otomatis keluar.",
      );
    } catch (err) {
      Alert.alert(
        "Gagal",
        err instanceof Error ? err.message : "Gagal mengubah kata sandi.",
      );
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

          <View className="rounded-lg bg-white p-4 border border-slate-200">
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

            {tenantName !== null && (
              <InputField
                icon="leaf-outline"
                label="Nama Kebun / Perusahaan"
                value={tenantName}
                onChangeText={setTenantName}
              />
            )}

            <InputField
              icon="mail-outline"
              label="Email (tidak dapat diubah)"
              value={email}
              onChangeText={() => {}}
              readOnly
            />

            <ActionButton
              label="Simpan Profil"
              loading={isSaving}
              onPress={handleSaveProfile}
            />
          </View>

          <Text className="mb-2 mt-6 font-bold text-sm text-slate-900">
            Keamanan Akun
          </Text>

          <View className="rounded-lg bg-white p-4 border border-slate-200">
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
  readOnly = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secure?: boolean;
  readOnly?: boolean;
}) {
  return (
    <View className="mb-3.5">
      <Text className="mb-1.5 text-xs font-semibold text-slate-700">
        {label}
      </Text>

      <View
        className={`flex-row items-center rounded-lg border border-slate-200 px-3 ${readOnly ? "bg-slate-100" : "bg-slate-50"}`}
      >
        <Ionicons name={icon} size={18} color="#64748B" />

        <TextInput
          className="ml-2.5 flex-1 py-2.5 text-sm text-slate-900"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          editable={!readOnly}
          autoCapitalize="none"
          placeholder={label}
          placeholderTextColor="#94A3B8"
        />
      </View>
    </View>
  );
}

function ActionButton({
  label,
  loading,
  onPress,
}: {
  label: string;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: loading }}
      className={`mt-1 rounded-lg py-3 items-center justify-center ${
        loading ? "bg-slate-300" : "bg-emerald-700 active:bg-emerald-800"
      }`}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={colors.icon.neutral} />
      ) : (
        <Text className="text-center font-bold text-white text-sm">
          {label}
        </Text>
      )}
    </Pressable>
  );
}
