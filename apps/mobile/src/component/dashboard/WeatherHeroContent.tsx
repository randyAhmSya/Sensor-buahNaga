import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { WeatherInfo } from "@/constant/dashboard";

interface WeatherHeroContentProps {
  greetingName: string;
  today: string;
  weather: WeatherInfo;
  children?: React.ReactNode;
}

export function WeatherHeroContent({
  greetingName,
  today,
  weather,
  children,
}: WeatherHeroContentProps) {
  return (
    <View className="bg-white border-b border-slate-200 px-4 pt-2 pb-5">
      {children}

      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-xl font-bold tracking-tight text-slate-900">
            Halo, {greetingName}
          </Text>
          <Text className="text-xs font-medium text-slate-600 mt-0.5">
            {today}
          </Text>
        </View>

        <View className="flex-row items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">
          <Ionicons name="sunny" size={22} color="#D97706" />
          <View>
            <Text className="text-sm font-extrabold text-slate-900">
              {weather.temperatureC}°C
            </Text>
            <Text className="text-[11px] font-semibold text-slate-600">
              {weather.condition}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
