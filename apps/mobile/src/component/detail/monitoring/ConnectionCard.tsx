import React from "react";
import { Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/component/ui/Card";

interface Props {
  connection: {
    signal: string;
    mqttConnected: boolean;
  };
}

export function ConnectionCard({ connection }: Props) {
  return (
    <Card className="p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons name="wifi" size={20} color="#166534" />

          <Text className="text-sm text-gray-700">
            Signal: {connection.signal}
          </Text>
        </View>

        <View className="rounded-full bg-green-700 px-3 py-1">
          <Text className="text-xs font-semibold text-white">
            MQTT Connected
          </Text>
        </View>
      </View>
    </Card>
  );
}
