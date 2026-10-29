import React, { memo, useCallback } from "react";
import { View } from "react-native";
import { GroupedSection } from "@/component/ui/GroupedSection";
import type { MonitoringGroup, MonitoringNode } from "@/constant/monitoring";
import { NodeCard } from "./NodeCard";

interface NodeSectionProps {
  group: MonitoringGroup;
  onNodePress?: (id: string) => void;
}

export const NodeSection = memo(function NodeSection({
  group,
  onNodePress,
}: NodeSectionProps) {
  return (
    <View className=" pt-4">
      <GroupedSection label={group.dateLabel}>
        {group.nodes.map((node) => (
          <NodeSectionItem
            key={node.id}
            node={node}
            onNodePress={onNodePress}
          />
        ))}
      </GroupedSection>
    </View>
  );
});

interface NodeSectionItemProps {
  node: MonitoringNode;
  onNodePress?: (id: string) => void;
}

const NodeSectionItem = memo(function NodeSectionItem({
  node,
  onNodePress,
}: NodeSectionItemProps) {
  const handlePress = useCallback(() => {
    onNodePress?.(node.id);
  }, [node.id, onNodePress]);

  return <NodeCard node={node} onPress={handlePress} />;
});
