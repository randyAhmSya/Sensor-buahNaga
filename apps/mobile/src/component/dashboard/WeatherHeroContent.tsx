import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { DashboardBacaanTerakhir } from "@/types/dashboard";
import { formatJamMenit } from "@/utils/date";

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

export function WeatherHeroContent({
  greetingName,
  today,
  farmName = "Kebun Buah Naga",
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

  return (
    <View className="px-4 pt-1 pb-2">
      {/* Header bar opsional (judul app / notifikasi) */}
      {children}

      {/* Hero Banner Agritech Solid Kontras Tinggi */}
      <View
        className="rounded-lg p-4 border"
        style={{
          backgroundColor: "#064E3B", // Solid dark emerald
          borderColor: "#047857",     // Border tegas emerald
        }}
      >
        {/* Baris 1: Identitas Kebun & Status Sistem */}
        <View className="flex-row items-center justify-between gap-2">
          <View
            className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-md border"
            style={{
              backgroundColor: "#065F46",
              borderColor: "#047857",
            }}
          >
            <Ionicons name="leaf" size={12} color="#A7F3D0" />
            <Text className="text-[11px] font-bold uppercase tracking-wider text-[#A7F3D0]">
              {farmName}
            </Text>
          </View>

          <View
            className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-md border"
            style={{
              backgroundColor: "#065F46",
              borderColor: "#047857",
            }}
          >
            <View
              className={`w-2 h-2 rounded-full ${
                nodeStats.online > 0 ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            <Text className="text-[11px] font-bold text-emerald-100">
              {nodeStats.online > 0 ? "Sistem Aktif" : "Semua Offline"}
            </Text>
          </View>
        </View>

        {/* Baris 2: Sapaan Petani & Tanggal */}
        <View className="mt-3">
          <Text className="text-xl font-extrabold tracking-tight text-white">
            Halo, {greetingName}!
          </Text>
          <Text className="text-xs font-medium text-emerald-200 mt-0.5">
            {today}
          </Text>
        </View>

        {/* Baris 3: Strip Metrik Operasional Kebun Riil */}
        <View className="flex-row gap-2 mt-4">
          {/* Metrik 1: Rasio Node Online */}
          <View
            className="flex-1 p-2.5 rounded-lg items-center border justify-center"
            style={{
              backgroundColor: "#065F46",
              borderColor: "#047857",
            }}
          >
            <Ionicons name="hardware-chip-outline" size={16} color="#A7F3D0" />
            <Text className="text-sm font-black text-white mt-1">
              {nodeStats.online}/{nodeStats.total}
            </Text>
            <Text className="text-[10px] font-semibold text-emerald-200 mt-0.5">
              Node Online
            </Text>
          </View>

          {/* Metrik 2: Jumlah Blok Aktif */}
          <View
            className="flex-1 p-2.5 rounded-lg items-center border justify-center"
            style={{
              backgroundColor: "#065F46",
              borderColor: "#047857",
            }}
          >
            <Ionicons name="grid-outline" size={16} color="#A7F3D0" />
            <Text className="text-sm font-black text-white mt-1">
              {jumlahBlok} Blok
            </Text>
            <Text className="text-[10px] font-semibold text-emerald-200 mt-0.5">
              Blok Lahan
            </Text>
          </View>

          {/* Metrik 3: Cahaya Terakhir */}
          <View
            className="flex-1 p-2.5 rounded-lg items-center border justify-center"
            style={{
              backgroundColor: "#065F46",
              borderColor: "#047857",
            }}
          >
            <Ionicons name="sunny-outline" size={16} color="#A7F3D0" />
            {!bacaanTerbaru ? (
              <>
                <Text className="text-xs font-bold text-slate-300 mt-1 text-center">
                  Belum ada data
                </Text>
                <Text className="text-[10px] font-semibold text-emerald-200 mt-0.5">
                  Cahaya Terakhir
                </Text>
              </>
            ) : bacaanTerbaru.basi ? (
              <>
                <Text className="text-[11px] font-bold text-slate-200 mt-1 text-center">
                  Data terakhir {formatJamMenit(bacaanTerbaru.dicatat_pada)}
                </Text>
                <Text className="text-[10px] font-semibold text-emerald-200 mt-0.5">
                  Cahaya ({bacaanTerbaru.nilai_lux} lx)
                </Text>
              </>
            ) : (
              <>
                <Text className="text-sm font-black text-white mt-1">
                  {bacaanTerbaru.nilai_lux.toLocaleString("id-ID")} lx
                </Text>
                <Text className="text-[10px] font-semibold text-emerald-200 mt-0.5">
                  Cahaya Node
                </Text>
              </>
            )}
          </View>

          {/* Metrik 4: Suhu Udara (HANYA jika suhu bukan null) */}
          {hasSuhu && (
            <View
              className="flex-1 p-2.5 rounded-lg items-center border justify-center"
              style={{
                backgroundColor: "#065F46",
                borderColor: "#047857",
              }}
            >
              <Ionicons name="thermometer-outline" size={16} color="#A7F3D0" />
              <Text className="text-sm font-black text-white mt-1">
                {Math.round(Number(bacaanTerbaru.suhu))}°C
              </Text>
              <Text className="text-[10px] font-semibold text-emerald-200 mt-0.5">
                Suhu Udara
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
