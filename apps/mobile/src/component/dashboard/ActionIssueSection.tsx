import React from "react";
import { View } from "react-native";
import { GroupedSection } from "@/component/ui/GroupedSection";
import type { ActionIssueGroup } from "@/constant/dashboard";
import { ActionIssueCard } from "./ActionIssueCard";

interface ActionIssueSectionProps {
  group: ActionIssueGroup;
  onIssuePress?: (id: string) => void;
}

export function ActionIssueSection({
  group,
  onIssuePress,
}: ActionIssueSectionProps) {
  return (
    <View className="mt-4">
      <GroupedSection label={group.category} uppercase>
        {group.issues.map((issue) => (
          <ActionIssueCard
            key={issue.id}
            issue={issue}
            onPress={() => onIssuePress?.(issue.id)}
          />
        ))}
      </GroupedSection>
    </View>
  );
}
