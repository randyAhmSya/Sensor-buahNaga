import React from "react";
import { View } from "react-native";
import { SensorCard } from "./SensorCard";
import type {
  NodeRingkasanBacaan,
  NodeRingkasanEnergi,
  NodeRingkasanDimming,
} from "@/types/api/nodeRingkasan.dto";
import { formatWaktuBasi } from "@/utils/date";

interface Props {
  bacaan: NodeRingkasanBacaan | null;
  energi: NodeRingkasanEnergi;
  dimming: NodeRingkasanDimming | null;
}

export function SensorGrid({ bacaan, energi, dimming }: Props) {
  // 1. Cahaya (Lux)
  const luxValue =
    bacaan?.nilai_lux !== null && bacaan?.nilai_lux !== undefined
      ? `${bacaan.nilai_lux.toLocaleString("id-ID")} Lux`
      : "Belum ada data";
  const luxBasi = Boolean(bacaan?.basi);
  const luxTimeLabel = luxBasi ? formatWaktuBasi(bacaan?.dicatat_pada) : null;

  // 2. Suhu (°C)
  const tempValue =
    bacaan?.suhu !== null && bacaan?.suhu !== undefined
      ? `${bacaan.suhu}°C`
      : "Tidak tersedia";
  const tempBasi = Boolean(bacaan?.basi && bacaan?.suhu !== null);
  const tempTimeLabel = tempBasi ? formatWaktuBasi(bacaan?.dicatat_pada) : null;

  // 3. Energi (W & kWh 24 jam)
  const energyValue =
    energi?.watt_terakhir !== null && energi?.watt_terakhir !== undefined
      ? `${energi.watt_terakhir} W`
      : "Belum ada data";
  const energyBasi = Boolean(energi?.basi);
  const energyTimeLabel = energyBasi ? formatWaktuBasi(energi?.dicatat_pada) : null;
  const energySubInfo = !energyBasi && energi?.kwh_24_jam !== undefined
    ? `${energi.kwh_24_jam} kWh (24 jam)`
    : null;

  // 4. Dimming (%)
  const dimmingValue =
    dimming?.kecerahan_persen !== null && dimming?.kecerahan_persen !== undefined
      ? `${dimming.kecerahan_persen}%`
      : "Belum ada data";
  const dimmingBasi = Boolean(dimming?.basi);
  const dimmingTimeLabel = dimmingBasi ? formatWaktuBasi(dimming?.dicatat_pada) : null;
  const dimmingSubInfo = !dimmingBasi && dimming?.fase_bulan
    ? `Fase: ${dimming.fase_bulan}`
    : null;

  return (
    <View className="gap-3">
      {/* Baris 1: Cahaya & Suhu */}
      <View className="flex-row gap-3">
        <SensorCard
          icon="sunny-outline"
          label="Cahaya"
          value={luxValue}
          isBasi={luxBasi}
          timeLabel={luxTimeLabel}
        />

        <SensorCard
          icon="thermometer-outline"
          label="Suhu"
          value={tempValue}
          isBasi={tempBasi}
          timeLabel={tempTimeLabel}
        />
      </View>

      {/* Baris 2: Energi & Dimming */}
      <View className="flex-row gap-3">
        <SensorCard
          icon="flash-outline"
          label="Energi"
          value={energyValue}
          isBasi={energyBasi}
          timeLabel={energyTimeLabel}
          subInfo={energySubInfo}
        />

        <SensorCard
          icon="bulb-outline"
          label="Dimming"
          value={dimmingValue}
          isBasi={dimmingBasi}
          timeLabel={dimmingTimeLabel}
          subInfo={dimmingSubInfo}
        />
      </View>
    </View>
  );
}
