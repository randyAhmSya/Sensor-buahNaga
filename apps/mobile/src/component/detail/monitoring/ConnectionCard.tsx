import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/component/ui/Card";

interface Props {
  connection: {
    signal: string | null;
    mqttConnected: boolean;
    lastSeen?: string | null;
  };
}

export function ConnectionCard({ connection }: Props) {
  const isConnected = connection.mqttConnected;

  return (
    <Card className="p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons
            name="wifi"
            size={20}
            color={isConnected ? "#166534" : "#9CA3AF"}
          />

          <Text className="text-sm text-gray-700">
            Jaringan: {connection.signal || (isConnected ? "Terhubung" : "Terputus")}
          </Text>
        </View>

        <View
          className={`rounded-full px-3 py-1 ${
            isConnected ? "bg-emerald-700" : "bg-slate-400"
          }`}
        >
          <Text className="text-xs font-semibold text-white">
            {isConnected ? "MQTT Terhubung" : "MQTT Terputus"}
          </Text>
        </View>
      </View>

      {connection.lastSeen && (
        <Text className="text-xs text-gray-400 mt-2">
          Terakhir terhubung: {connection.lastSeen}
        </Text>
      )}
    </Card>
  );
}
