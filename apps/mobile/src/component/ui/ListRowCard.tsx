import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/component/ui/Card";
import { PressableOpacity } from "@/component/ui/PressableOpacity";

interface ListRowCardProps {
  // Elemen di kiri -- biasanya icon bulat (NodeCard/ActionIssueCard) atau
  // thumbnail foto (ActivityCard/HarvestEstimateCard). Dibiarin bebas
  // (ReactNode) karena bentuknya beda-beda tiap pemakaian.
  leading?: React.ReactNode;
  // Konten utama di tengah -- title, subtitle, badge, progress bar, dst.
  // Ini yang paling sering beda antar pemakaian, makanya dibikin children bebas.
  children: React.ReactNode;
  // Default-nya chevron kanan (paling umum), tapi bisa di-override
  // (misal ActivityCard butuh jam di atas chevron).
  trailing?: React.ReactNode;
  onPress?: () => void;
}

export function ListRowCard({
  leading,
  children,
  trailing,
  onPress,
}: ListRowCardProps) {
  return (
    <PressableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card className="mb-3 flex-row items-center gap-3 p-3">
        {leading}
        <View className="flex-1">{children}</View>
        {trailing ?? (
          <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        )}
      </Card>
    </PressableOpacity>
  );
}
