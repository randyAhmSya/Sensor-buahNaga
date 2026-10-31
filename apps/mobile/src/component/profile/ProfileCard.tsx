import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/component/ui/Card";
import { StatusBadge } from "@/component/ui/StatusBadge";
import { Avatar } from "@/component/ui/Avatar";
import type { UserProfile } from "@/constant/profile";

interface ProfileCardProps {
  user: UserProfile;
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <View className="mx-4 mt-4">
      <Card className="p-5 border border-slate-200 bg-white items-center">
        {/* Foto Profil / Avatar Inisial Bundar di Tengah */}
        <Avatar name={user.name} uri={user.avatarUrl} size={80} />

        {/* Nama Pengguna */}
        <Text className="text-lg font-bold text-slate-900 mt-3 text-center" numberOfLines={1}>
          {user.name}
        </Text>

        {/* Alamat Email */}
        {user.email ? (
          <Text className="text-xs font-medium text-slate-600 mt-0.5 text-center" numberOfLines={1}>
            {user.email}
          </Text>
        ) : null}

        {/* Badge Peran Solid */}
        {user.role ? (
          <View className="mt-2.5">
            <StatusBadge tone="neutral" label={user.role} />
          </View>
        ) : null}

        {/* Lokasi Kebun */}
        <View className="mt-4 pt-3 border-t border-slate-200 w-full flex-row items-center justify-center gap-1.5">
          <Ionicons name="location-outline" size={14} color="#047857" />
          <Text className="text-xs font-medium text-slate-600 text-center" numberOfLines={1}>
            {user.location}
          </Text>
        </View>
      </Card>
    </View>
  );
}
