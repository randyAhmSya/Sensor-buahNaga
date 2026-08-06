import React from "react";
import { View } from "react-native";
import { GroupedSection } from "@/component/ui/GroupedSection";
import type { MonitoringGroup } from "@/constant/monitoring";
import { NodeCard } from "./NodeCard";

interface NodeSectionProps {
  group: MonitoringGroup;
  onNodePress?: (id: string) => void;
}

export function NodeSection({ group, onNodePress }: NodeSectionProps) {
  return (
    <View className=" pt-4">
      <GroupedSection label={group.dateLabel}>
        {group.nodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            onPress={() => onNodePress?.(node.id)}
          />
        ))}
      </GroupedSection>
    </View>
  );
}
