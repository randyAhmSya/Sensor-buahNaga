import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Props {
  node: string;
}

export function HarvestHeader({ node }: Props) {
  return (
    <View className="h-14 flex-row items-center justify-between bg-white px-4 border-b border-gray-100">
      <Pressable
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)');
          }
        }}
        className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
        accessibilityRole="button"
        accessibilityLabel="Kembali"
      >
        <Ionicons name="arrow-back" size={20} color="#1F2937" />
      </Pressable>

      <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>
        Siklus Panen: {node}
      </Text>

      <View className="w-9" />
    </View>
  );
}