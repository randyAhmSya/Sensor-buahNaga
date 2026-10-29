import React from 'react';
import { DashboardHeader } from './DashboardHeader';
import { WeatherHeroContent } from './WeatherHeroContent';
import type { WeatherInfo } from '@/constant/dashboard';

interface WeatherHeroProps {
  appName: string;
  greetingName: string;
  today: string;
  weather: WeatherInfo;
  onNotificationPress?: () => void;
  unreadNotificationCount?: number;
}

export function WeatherHero({
  appName,
  greetingName,
  today,
  weather,
  onNotificationPress,
  unreadNotificationCount = 0,
}: WeatherHeroProps) {
  return (
    <WeatherHeroContent
      greetingName={greetingName}
      today={today}
      weather={weather}
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
