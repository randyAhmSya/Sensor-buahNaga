import React, { memo, useCallback } from "react";
import { View } from "react-native";
import { GroupedSection } from "@/component/ui/GroupedSection";
import type { ActionIssue, ActionIssueGroup } from "@/constant/dashboard";
import { ActionIssueCard } from "./ActionIssueCard";

interface ActionIssueSectionProps {
  group: ActionIssueGroup;
  onIssuePress?: (id: string) => void;
}

export const ActionIssueSection = memo(function ActionIssueSection({
  group,
  onIssuePress,
}: ActionIssueSectionProps) {
  return (
    <View className="mt-4">
      <GroupedSection label={group.category} uppercase>
        {group.issues.map((issue) => (
          <ActionIssueSectionItem
            key={issue.id}
            issue={issue}
            onIssuePress={onIssuePress}
          />
        ))}
      </GroupedSection>
    </View>
  );
});

interface ActionIssueSectionItemProps {
  issue: ActionIssue;
  onIssuePress?: (id: string) => void;
}

const ActionIssueSectionItem = memo(function ActionIssueSectionItem({
  issue,
  onIssuePress,
}: ActionIssueSectionItemProps) {
  const handlePress = useCallback(() => {
    onIssuePress?.(issue.id);
  }, [issue.id, onIssuePress]);

  return <ActionIssueCard issue={issue} onPress={handlePress} />;
});
