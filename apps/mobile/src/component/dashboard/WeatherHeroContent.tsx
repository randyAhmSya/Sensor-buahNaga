import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { DashboardBacaanTerakhir } from "@/types/dashboard";
import { formatJamMenit } from "@/utils/date";
import { colors, radius } from "@/theme/tokens";
import { ProgressRing } from "@/component/ui/ProgressRing";

// Foto latar hero (taruh di assets/images/hero.webp)
const HERO_IMG = require("@/assets/images/hero.webp");

interface WeatherHeroContentProps {
  greetingName: string;
  today: string;
  farmName?: string;
  nodeStats?: {
    online: number;
    total: number;
  };
  jumlahBlok?: number;
  bacaanTerbaru?: DashboardBacaanTerakhir | null;
  children?: React.ReactNode;
}

/** Ubin metrik berlatar kaca di atas hero hijau: angka besar, label kecil. */
function MetricTile({
  icon,
  value,
  label,
  valueSize = 22,
  progress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  valueSize?: number;
  /** Bila diisi (0..1), ikon dilingkari cincin progres. */
  progress?: number;
}) {
  return (
    <View
      className="flex-1 items-center justify-center rounded-2xl px-1.5 py-3"
      style={{
        backgroundColor: colors.heroPhoto.tileBg,
        borderWidth: 1,
        borderColor: colors.heroPhoto.tileBorder,
      }}
    >
      {progress !== undefined ? (
        <ProgressRing
          progress={progress}
          size={34}
          strokeWidth={3}
          trackColor={colors.heroPhoto.ringTrack}
          color={colors.heroPhoto.ringProgress}
        >
          <Ionicons name={icon} size={16} color={colors.hero.icon} />
        </ProgressRing>
      ) : (
        <View className="h-[34px] w-[34px] items-center justify-center">
          <Ionicons name={icon} size={20} color={colors.hero.icon} />
        </View>
      )}
      <Text
        className="mt-2 font-extrabold text-white"
        style={{ fontSize: valueSize, lineHeight: valueSize + 4 }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text
        className="mt-0.5 text-center font-semibold"
        style={{ fontSize: 11, color: colors.heroPhoto.label }}
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  );
}

export function WeatherHeroContent({
  greetingName,
  today,
  farmName = "Kebun",
  nodeStats = { online: 0, total: 0 },
  jumlahBlok = 0,
  bacaanTerbaru = null,
  children,
}: WeatherHeroContentProps) {
  const hasSuhu =
    bacaanTerbaru !== null &&
    bacaanTerbaru !== undefined &&
    bacaanTerbaru.suhu !== null &&
    bacaanTerbaru.suhu !== undefined;

  const aktif = nodeStats.online > 0;

  let cahayaValue = "-";
  let cahayaLabel = "Cahaya Terakhir";
  if (bacaanTerbaru) {
    cahayaValue = `${Math.round(Number(bacaanTerbaru.nilai_lux)).toLocaleString("id-ID")} lx`;
    cahayaLabel = bacaanTerbaru.basi
      ? `Terakhir ${formatJamMenit(bacaanTerbaru.dicatat_pada)}`
      : "Cahaya Node";
  }

  return (
    <View className="px-4 pt-1 pb-2">
      {/* Header bar opsional (judul app / notifikasi) */}
      {children}

      {/* Hero: foto latar + lapisan hijau tua, sudut besar, ubin metrik berlatar kaca */}
      <View
        style={{
          borderRadius: radius.hero,
          overflow: "hidden",
          boxShadow: colors.heroPhoto.shadow,
        }}
      >
        <ImageBackground
          source={HERO_IMG}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          pointerEvents="none"
          colors={[...colors.heroPhoto.overlay]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View className="p-4">
          {/* Baris 1: identitas kebun & status sistem */}
          <View className="flex-row items-center justify-between gap-2">
            <View
              className="flex-1 flex-row items-center gap-1.5 self-start rounded-full px-3 py-1.5"
              style={{
                backgroundColor: colors.heroPhoto.chipBg,
                borderWidth: 1,
                borderColor: colors.heroPhoto.chipBorder,
              }}
            >
              <Ionicons name="leaf" size={12} color={colors.hero.icon} />
              <Text
                className="flex-shrink text-xs font-bold uppercase tracking-wider"
                style={{ color: colors.hero.textAccent }}
                numberOfLines={1}
              >
                {farmName}
              </Text>
            </View>

            <View
              className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{
                backgroundColor: colors.heroPhoto.chipBg,
                borderWidth: 1,
                borderColor: colors.heroPhoto.chipBorder,
              }}
            >
              <View
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: aktif
                    ? colors.heroPhoto.onlineDot
                    : colors.heroPhoto.offlineDot,
                }}
              />
              <Text className="text-xs font-bold text-emerald-50">
                {aktif ? "Sistem Aktif" : "Semua Offline"}
              </Text>
            </View>
          </View>

          {/* Baris 2: sapaan & tanggal */}
          <View className="mt-4">
            <Text className="text-2xl font-extrabold tracking-tight text-white">
              Halo, {greetingName}!
            </Text>
            <Text className="mt-0.5 text-xs font-medium text-emerald-100">
              {today}
            </Text>
          </View>

          {/* Baris 3: metrik operasional */}
          <View className="mt-4 flex-row gap-2.5">
            <MetricTile
              icon="hardware-chip-outline"
              value={`${nodeStats.online}/${nodeStats.total}`}
              label="Node Online"
              progress={
                nodeStats.total > 0 ? nodeStats.online / nodeStats.total : 0
              }
            />
            <MetricTile
              icon="grid-outline"
              value={String(jumlahBlok)}
              label="Blok Lahan"
            />
            <MetricTile
              icon="sunny-outline"
              value={cahayaValue}
              label={cahayaLabel}
              valueSize={bacaanTerbaru ? 18 : 22}
            />
            {hasSuhu && bacaanTerbaru && (
              <MetricTile
                icon="thermometer-outline"
                value={`${Math.round(Number(bacaanTerbaru.suhu))}°C`}
                label="Suhu Udara"
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
