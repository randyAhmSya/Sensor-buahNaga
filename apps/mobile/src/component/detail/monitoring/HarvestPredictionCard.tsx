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
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200">
          <Ionicons name="calendar-outline" size={18} color="#059669" />
        </View>

        <View className="flex-1" style={{ flexShrink: 1 }}>
          <Text className="font-bold text-sm text-slate-900" numberOfLines={1}>
            Estimasi Panen Blok {harvest.block}
          </Text>
        </View>
      </View>

      <View className="mt-4 gap-3 flex-row">
        <View className="flex-1 items-start bg-slate-50 p-3 rounded-xl border border-slate-200">
          <Text className="font-semibold text-xs text-slate-600 mb-1">
            Mulai Siklus
          </Text>
          <Text className="font-extrabold text-sm text-slate-900">
            {harvest.startCycle || "-"}
          </Text>
        </View>

        <View className="flex-1 items-start bg-slate-50 p-3 rounded-xl border border-slate-200">
          <Text className="font-semibold text-xs text-slate-600 mb-1">
            Target Waktu
          </Text>
          <Text className="font-extrabold text-sm text-slate-900">
            {harvest.targetTime || "-"}
          </Text>
        </View>
      </View>

      <View className="mt-3 rounded-xl p-3.5 bg-emerald-50 border border-emerald-200">
        <Text className="text-xs font-semibold text-emerald-800">
          Estimasi Tanggal Panen
        </Text>
        <Text className="mt-1 text-sm font-extrabold text-emerald-950">
          {harvest.prediction || "Belum ada prediksi siklus aktif"}
        </Text>
      </View>
    </Card>
  );
}
