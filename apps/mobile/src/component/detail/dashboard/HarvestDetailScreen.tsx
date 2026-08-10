import React from "react";

import { ScrollView, View } from "react-native";

import { useHarvestDetail } from "@/hooks/useHarvestDetail";

import { HarvestHeader } from "./HarvestHeader";

import { HarvestNodeCard } from "./HarvestNodeCard";

import { Progress } from "./Progress";

import { HarvestInfoCard } from "./HarvestInfoCard";

interface Props {
  nodeId?: string;
}

export function HarvestDetailScreen({ nodeId }: Props) {
  const { harvest } = useHarvestDetail(nodeId);

  if (!harvest) {
    return null;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <HarvestHeader node={harvest.node} />

      <ScrollView
        showsVerticalScrollIndicator={false}

        contentContainerClassName="px-4 pb-8"
      >
        <HarvestNodeCard data={harvest} />

        <Progress percent={harvest.maturity} />

        <HarvestInfoCard data={harvest} />
      </ScrollView>
    </View>
  );
}
