import React from "react";
import { Text, View, Image } from "react-native";

import { Card } from "@/component/ui/Card";

import type { NodeDetail } from "@/constant/NodeDetails";
import { TAB_COLORS } from "@/constant/Tabs";

interface Props {
  node: NodeDetail;
}

export function NodeHeroCard({ node }: Props) {
  return (
    <Card className="mt-4 overflow-hidden">
      <View className="h-44 bg-green-100">
        {node.image ? (
          <Image
            source={{
              uri: node.image,
            }}
            className="h-full w-full"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-5xl">🌱</Text>
          </View>
        )}
      </View>

      <View className="p-4">
        <View
          className="mt-3 self-start rounded-full border-2 items-center px-3 py-1"
          style={{ borderColor: TAB_COLORS.active }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: TAB_COLORS.active }}
          >
            Status: {node.status}
          </Text>
        </View>
        <Text className="mt-1 text-sm text-gray-500">{node.location}</Text>
      </View>
    </Card>
  );
}
