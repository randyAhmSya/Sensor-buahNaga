import React from "react";
import { View } from "react-native";
import type { ActionIssueGroup } from "@/constant/dashboard";
import { ActionIssueSection } from "./ActionIssueSection";

interface ActionNeededListProps {
  groups: ActionIssueGroup[];
  onIssuePress?: (id: string) => void;
}

// Beda dari HarvestEstimateList/ActivityList: sengaja gak ada "Lihat Semua"
// di sini, karena semua kategori masalah emang selalu ditampilin sekaligus
// (bukan daftar panjang yang perlu di-preview-cut kayak 2 section lainnya).
export function ActionNeededList({
  groups,
  onIssuePress,
}: ActionNeededListProps) {
  return (
    <View className="px-4 pt-2">
      {groups.slice(0, 8).map((group) => (
        <ActionIssueSection
          key={group.category}
          group={group}
          onIssuePress={onIssuePress}
        />
      ))}
    </View>
  );
}
