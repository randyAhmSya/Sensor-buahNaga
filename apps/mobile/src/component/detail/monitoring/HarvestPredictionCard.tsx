import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/component/ui/Card";

interface Props {
  harvest: {
    block: string;
    startCycle: string | null;
    targetTime: string | null;
    prediction: string | null;
  };
}

export function HarvestPredictionCard({ harvest }: Props) {
  return (
    <Card className="p-4 border border-slate-200 bg-white">
      <View className="flex-row items-center gap-2.5">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-white border-[1.5px] border-[#047857]">
          <Ionicons name="calendar-outline" size={18} color="#047857" />
        </View>

        <View className="flex-1" style={{ flexShrink: 1 }}>
          <Text className="font-bold text-sm text-slate-900" numberOfLines={1}>
            Estimasi Panen Blok {harvest.block}
          </Text>
        </View>
      </View>

      <View className="mt-4 gap-3 flex-row">
        <View className="flex-1 items-start bg-white p-3 rounded-lg border-[1.5px] border-slate-400">
          <Text className="font-semibold text-xs text-slate-600 mb-1">
            Mulai Siklus
          </Text>
          <Text className="font-extrabold text-sm text-slate-900">
            {harvest.startCycle || "-"}
          </Text>
        </View>

        <View className="flex-1 items-start bg-white p-3 rounded-lg border-[1.5px] border-slate-400">
          <Text className="font-semibold text-xs text-slate-600 mb-1">
            Target Waktu
          </Text>
          <Text className="font-extrabold text-sm text-slate-900">
            {harvest.targetTime || "-"}
          </Text>
        </View>
      </View>

      <View className="mt-3 rounded-lg p-3.5 bg-white border-[1.5px] border-slate-400">
        <Text className="text-xs font-bold text-slate-700">
          Estimasi Tanggal Panen
        </Text>
        <Text className="mt-1 text-sm font-extrabold text-slate-900">
          {harvest.prediction || "Belum ada prediksi siklus aktif"}
        </Text>
      </View>
    </Card>
  );
}
