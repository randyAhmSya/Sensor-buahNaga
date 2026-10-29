import React from "react";
import { Text, View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/component/ui/Card";
import type { NodeDetail } from "@/constant/NodeDetails";

interface Props {
  node: NodeDetail;
}

export function NodeHeroCard({ node }: Props) {
  const isOnline = node.status === "ACTIVE";

  return (
    <Card className="mt-4 overflow-hidden border border-slate-200 bg-white">
      {node.image && node.image.trim() !== "" ? (
        <View className="h-44 w-full">
          <Image
            source={{ uri: node.image }}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>
      ) : null}

      <View className="p-4">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-2.5 flex-1 mr-2" style={{ flexShrink: 1 }}>
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200">
              <Ionicons name="hardware-chip-outline" size={18} color="#059669" />
            </View>
            <View className="flex-1" style={{ flexShrink: 1 }}>
              <Text className="text-base font-bold text-slate-900" numberOfLines={1}>
                {node.name || node.id}
              </Text>
              <Text className="text-xs text-slate-600 mt-0.5" numberOfLines={1}>
                {node.location}
              </Text>
            </View>
          </View>

          <View
            className={`rounded-full px-3 py-1 border ${
              isOnline
                ? "bg-emerald-50 border-emerald-300"
                : "bg-slate-100 border-slate-300"
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                isOnline ? "text-emerald-800" : "text-slate-700"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        </View>

        <View className="mt-3 pt-3 border-t border-slate-200 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Ionicons
              name={isOnline ? "wifi" : "wifi-outline"}
              size={14}
              color={isOnline ? "#059669" : "#64748B"}
            />
            <Text className="text-xs font-medium text-slate-600">
              {node.connection.signal || (isOnline ? "Terhubung" : "Terputus")}
            </Text>
          </View>

          {node.connection.lastSeen ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="time-outline" size={12} color="#64748B" />
              <Text className="text-xs text-slate-600">
                {node.connection.lastSeen}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
}
