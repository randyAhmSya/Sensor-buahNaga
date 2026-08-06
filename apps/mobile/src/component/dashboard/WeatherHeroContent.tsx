import React from "react";
import { ImageBackground, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { WeatherInfo } from "@/constant/dashboard";

interface WeatherHeroContentProps {
  greetingName: string;
  today: string;
  weather: WeatherInfo;
  children?: React.ReactNode;
}

const HERO_IMAGE = {
  uri: "https://images.unsplash.com/photo-1620200423727-8127f75d7f53?w=800",
};

export function WeatherHeroContent({
  greetingName,
  today,
  weather,
  children,
}: WeatherHeroContentProps) {
  return (
    <ImageBackground
      source={HERO_IMAGE}
      resizeMode="cover"
      className="overflow-hidden pb-14"
    >
      <View className="py-2 px-4">
        {children}

        <Text className="pt-5 font-semibold text-lg text-[#151C25]">
          Hello, {greetingName}
        </Text>

        <Text className="text-sm text-[#404941]">{today}</Text>

        <View className="flex-row items-center gap-3 py-5">
          <Ionicons name="sunny" size={32} color="#FACC15" />

          <View>
            <Text className="text-3xl font-bold text-[#151C25]">
              {weather.temperatureC}°C
            </Text>

            <Text className="text-xs font-semibold text-[#404941]">
              {weather.condition}
            </Text>
          </View>
        </View>
      </View>

      <LinearGradient
        colors={[
          "rgba(255,255,255,0)",
          "rgba(255,255,255,0.8)",
          "rgba(255,255,255,1)",
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 100,
        }}
      />
    </ImageBackground>
  );
}
