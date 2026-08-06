import React from "react";
import { DashboardHeader } from "./DashboardHeader";
import { WeatherHeroContent } from "./WeatherHeroContent";
import type { WeatherInfo } from "@/constant/dashboard";

interface WeatherHeroProps {
  appName: string;
  greetingName: string;
  today: string;
  weather: WeatherInfo;
  onNotificationPress?: () => void;
}

export function WeatherHero({
  appName,
  greetingName,
  today,
  weather,
  onNotificationPress,
}: WeatherHeroProps) {
  return (
    <WeatherHeroContent
      greetingName={greetingName}
      today={today}
      weather={weather}
    >
      <DashboardHeader
        appName={appName}
        tone="light"
        onNotificationPress={onNotificationPress}
      />
    </WeatherHeroContent>
  );
}
