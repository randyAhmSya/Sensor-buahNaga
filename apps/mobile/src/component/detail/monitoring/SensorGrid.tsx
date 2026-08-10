import React from "react";
import { View } from "react-native";

import { SensorCard } from "./SensorCard";

interface Props {
  sensor: {
    lightLux: number;
    temperature: number;
    energyUsed: number;
    dimmingLevel: number;
  };
}

export function SensorGrid({ sensor }: Props) {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <SensorCard
          icon="sunny"

          label="Cahaya"

          value={`${sensor.lightLux} Lux`}
          iconColor="#CEA700"
        />

        <SensorCard
          icon="thermometer"

          label="Suhu"

          value={`${sensor.temperature}°C`}
          iconColor="#BA1A1A"
        />
      </View>

      <View className="flex-row gap-3">
        <SensorCard
          icon="flash"

          label="Energi"

          value={`${sensor.energyUsed}%`}
          iconColor="#14532D"
        />

        <SensorCard
          icon="bulb"

          label="Dimming"

          value={`${sensor.dimmingLevel}%`}
          iconColor="#2E6A41"
        />
      </View>
    </View>
  );
}
