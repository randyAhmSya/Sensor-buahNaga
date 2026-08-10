import React from "react";
import { ScrollView, Text, View } from "react-native";

import { useNodeDetail } from "@/hooks/useNodeDetails";

import { NodeHeroCard } from "./NodeHeroCard";
import { SensorGrid } from "./SensorGrid";
import { ConnectionCard } from "./ConnectionCard";
import { LightingScheduleCard } from "./LightingScheduleCard";
import { HarvestPredictionCard } from "./HarvestPredictionCard";
import { NodeDetailHeader } from "./NodeDetailHeader";

interface NodeDetailScreenProps {
  nodeId?: string;
}

export function NodeDetailScreen({ nodeId }: NodeDetailScreenProps) {
  const { node } = useNodeDetail(nodeId);

  if (!node) {
    return null;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <NodeDetailHeader nodeId={node.id} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-4 pb-8"
      >
        <NodeHeroCard node={node} />

        <View className="mt-5">
          <SensorGrid sensor={node.sensor} />
        </View>

        <View className="mt-5">
          <ConnectionCard connection={node.connection} />
        </View>

        <View className="mt-5">
          <LightingScheduleCard schedule={node.schedule} />
        </View>

        <View className="mt-5">
          <HarvestPredictionCard harvest={node.harvest} />
        </View>
      </ScrollView>
    </View>
  );
}
