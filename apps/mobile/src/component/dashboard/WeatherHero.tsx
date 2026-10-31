import React from "react";
import { DashboardHeader } from "./DashboardHeader";
import { WeatherHeroContent } from "./WeatherHeroContent";
import type { DashboardBacaanTerakhir } from "@/types/dashboard";

interface WeatherHeroProps {
  appName: string;
  greetingName: string;
  today: string;
  farmName?: string;
  nodeStats?: {
    online: number;
    total: number;
  };
  jumlahBlok?: number;
  bacaanTerbaru?: DashboardBacaanTerakhir | null;
  onNotificationPress?: () => void;
  unreadNotificationCount?: number;
}

export function WeatherHero({
  appName,
  greetingName,
  today,
  farmName,
  nodeStats,
  jumlahBlok,
  bacaanTerbaru,
  onNotificationPress,
  unreadNotificationCount = 0,
}: WeatherHeroProps) {
  return (
    <WeatherHeroContent
      greetingName={greetingName}
      today={today}
      farmName={farmName}
      nodeStats={nodeStats}
      jumlahBlok={jumlahBlok}
      bacaanTerbaru={bacaanTerbaru}
    >
      <DashboardHeader
        appName={appName}
        onNotificationPress={onNotificationPress}
        unreadCount={unreadNotificationCount}
        tone="light"
      />
    </WeatherHeroContent>
  );
}
