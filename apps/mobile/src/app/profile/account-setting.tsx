import React, { useState } from "react";

import { ScrollView, Text, TextInput, View, Pressable } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { AccountHeader } from "@/component/profile/AccountHeader";

export default function AccountSetting() {
  const [name, setName] = useState("Randy");
  const [phone, setPhone] = useState("+62 812-3456-7890");
  const [email, setEmail] = useState("randy@student.poliwangi.ac.id");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <View className="flex-1 bg-gray-50">
      <AccountHeader title="Account Settings" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <View className="mx-4">
          <Text className="mb-3 mt-3 font-semibold text-green-800">
            Informasi Profil
          </Text>

          <View className="rounded-2xl bg-white p-4">
            <InputField
              icon="person-outline"
              label="Nama Lengkap"
              value={name}
              onChangeText={setName}
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

          <Text className="mb-3 mt-5 font-semibold text-green-800">
            Keamanan Akun
          </Text>

          <View className="rounded-2xl bg-white p-4">
            <InputField
              icon="lock-closed-outline"
              label="Kata Sandi Saat Ini"
              value={oldPassword}
              onChangeText={setOldPassword}
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
            className="mt-8 rounded-xl bg-green-800 py-4"
            onPress={() => {
              console.log({
                name,
                phone,
                email,
              });
            }}
          >
            <Text className="text-center font-bold text-white">
              💾 Simpan Perubahan
            </Text>
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
  icon: any;
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  secure?: boolean;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm text-gray-600">{label}</Text>

      <View className="flex-row items-center rounded-xl border border-gray-200 px-3">
        <Ionicons name={icon} size={20} color="#9CA3AF" />

        <TextInput
          className="ml-3 flex-1 py-3 text-gray-800"

          value={value}

          onChangeText={onChangeText}

          secureTextEntry={secure}

          placeholder={label}
        />
      </View>
    </View>
  );
}
