import React from "react";
import { Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import type { NodeDetail } from "@/constant/NodeDetails";

import { Card } from "@/component/ui/Card";
import { TAB_COLORS } from "@/constant/Tabs";

interface Props {
  harvest: {
    block: string;
    startCycle: string;
    targetTime: string;
    prediction: string;
  };
}

export function HarvestPredictionCard({ harvest }: Props) {
  return (
    <Card className="p-4">
      <View className="flex-row items-center gap-3">
        <View className=" items-center justify-center ">
          <Ionicons name="calendar-outline" size={22} color="#166534" />
        </View>

        <View>
          <Text className="font-bold text-gray-900">
            Estimasi Panen Block {harvest.block}
          </Text>
        </View>
      </View>

      <View className="mt-5 gap-3 flex-row">
        <View className="flex-1 items-start">
          <View className="flex-row items-center gap-2">
            <Text
              className=" font-semibold text-xs"
              style={{ color: TAB_COLORS.subTitles }}
            >
              Mulai Siklus
            </Text>
          </View>

          <Text
            className="font-semibold text-lg"
            style={{ color: TAB_COLORS.subTitles }}
          >
            {harvest.startCycle}
          </Text>
        </View>

        <View className="flex-1 items-start">
          <View className="flex-row items-center gap-2">
            <Text
              className="font-semibold text-xs"
              style={{ color: TAB_COLORS.subTitles }}
            >
              Target Waktu
            </Text>
          </View>

          <Text
            className="font-semibold text-lg"
            style={{ color: TAB_COLORS.subTitles }}
          >
            {harvest.targetTime}
          </Text>
        </View>
      </View>

      <View
        className="mt-5 rounded-xl p-4"
        style={{ backgroundColor: "#EEF4FF" }}
      >
        <Text className="text-xs text-gray-500">Estimasi tanggal panen</Text>

        <View className="mt-1 flex-row items-center gap-2">
          <Text
            className="text-lg font-bold"
            style={{ color: TAB_COLORS.active }}
          >
            {harvest.prediction}
          </Text>
        </View>
      </View>
    </Card>
  );
}
