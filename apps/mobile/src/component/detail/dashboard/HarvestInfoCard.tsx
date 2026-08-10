import React from "react";
import { Text, View } from "react-native";

export function HarvestInfoCard({ data }: any) {
  return (
    <View className="mt-4 rounded-xl bg-white">
      <Item label="Mulai Siklus" value={data.startCycle} />

      <Item label="Estimasi Panen" value={data.harvestDate} />

      <Item label="Sisa Waktu" value={data.remaining} />

      <Item label="Estimasi Berat" value={data.weight} />
    </View>
  );
}

function Item({ label, value }: any) {
  return (
    <View className="flex-row justify-between border-b border-gray-100 px-4 py-3">
      <Text className="text-gray-500">{label}</Text>

      <Text className="font-semibold">{value}</Text>
    </View>
  );
}
