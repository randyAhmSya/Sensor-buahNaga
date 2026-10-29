import React from "react";
import { View } from "react-native";
import { SensorCard } from "./SensorCard";

interface Props {
  sensor: {
    lightLux: number | null;
    temperature: number | null;
    energyUsed: number | null;
    dimmingLevel: number | null;
  };
}

export function SensorGrid({ sensor }: Props) {
  const luxValue = sensor.lightLux !== null ? `${sensor.lightLux} Lux` : "-";
  const tempValue = sensor.temperature !== null ? `${sensor.temperature}°C` : "-";
  const energyValue = sensor.energyUsed !== null ? `${sensor.energyUsed} kWh` : "-";
  const dimmingValue = sensor.dimmingLevel !== null ? `${sensor.dimmingLevel}%` : "-";

  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <SensorCard
          icon="sunny"
          label="Cahaya"
          value={luxValue}
          iconColor="#D97706"
        />

        <SensorCard
          icon="thermometer"
          label="Suhu"
          value={tempValue}
          iconColor="#E11D48"
        />
      </View>

      <View className="flex-row gap-3">
        <SensorCard
          icon="flash"
          label="Energi"
          value={energyValue}
          iconColor="#059669"
        />

        <SensorCard
          icon="bulb"
          label="Dimming"
          value={dimmingValue}
          iconColor="#2563EB"
        />
      </View>
    </View>
  );
}
