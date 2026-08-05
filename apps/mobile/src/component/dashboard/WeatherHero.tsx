import React from "react";
import { DashboardHeader } from "./DashboardHeader";
import { WeatherInfo } from "@/constant/dashboard";
import { ImageBackground, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { TAB_COLORS } from "@/constant/Tabs"; // Sesuaikan path import warna Anda

interface WeatherHeroProps {
  appName: string;
  greetingName: string;
  today: string;
  weather: WeatherInfo;
  onNotificationPress?: () => void;
}

const HERO_IMAGE = {
  uri: "https://images.unsplash.com/photo-1620200423727-8127f75d7f53?w=800",
};

export function WeatherHero({
  appName,
  greetingName,
  today,
  weather,
  onNotificationPress,
}: WeatherHeroProps) {
  return (
    <ImageBackground
      source={HERO_IMAGE}
      resizeMode="cover"
      className="overflow-hidden pb-14"
    >
      <View className="py-2 px-4">
        <DashboardHeader
          appName={appName}
          onNotificationPress={onNotificationPress}
          tone="light"
        />

        <Text className="pt-5 font-semibold text-lg [#151C25]">
          Hello, {greetingName}
        </Text>

        <View>
          <Text className="text-sm [#404941]">{today}</Text>
        </View>

        <View className="flex-row py-5 gap-3 items-center">
          <Ionicons name="sunny" size={32} color="#FACC15" />

          <View className="flex-col items-start justify-center">
            <Text className="font-bold text-3xl [#151C25]">
              {weather.temperatureC}°C
            </Text>
            {/* Menggunakan style dengan warna dari TAB_COLORS tanpa kurung kurawal ganda */}
            <Text className="font-semibold text-xs [#404941]">
              {weather.condition}
            </Text>
          </View>
        </View>
      </View>

      {/* LinearGradient ditaruh di paling bawah di dalam ImageBackground dengan posisi absolut */}
      <LinearGradient
        colors={[
          "rgba(255, 255, 255, 0)",
          "rgba(255, 255, 255, 0.8)",
          "rgba(255, 255, 255, 1)",
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 100, // Dikecilkan sedikit tingginya agar pas sebagai transisi ke card di bawahnya
        }}
      />
    </ImageBackground>
  );
}
