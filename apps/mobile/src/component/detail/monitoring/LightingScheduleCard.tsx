import React, { useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { Card } from "@/component/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import { useJadwalLampuAktif } from "@/hooks/useJadwalLampu";
import { formatTimeToHHmm } from "@/service/jadwalLampuService";
import { ManualDimmingModal } from "./ManualDimmingModal";

interface Props {
  sensorId?: string;
  schedule?: {
    start: string | null;
    end: string | null;
    status: string;
  };
}

export function LightingScheduleCard({ sensorId, schedule }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const {
    jadwal,
    loading,
    error,
    isNotFound,
    refetch,
  } = useJadwalLampuAktif(sensorId);

  // Jika sedang memuat jadwal lampu dari backend
  if (loading && !jadwal) {
    return (
      <Card className="p-4 border border-slate-200">
        <View className="flex-row items-center justify-between">
          <Text className="font-bold text-xs text-slate-900">Mode Lampu</Text>
          <ActivityIndicator size="small" color="#059669" />
        </View>
        <View className="py-6 items-center justify-center">
          <Text className="text-xs text-slate-600">Memuat jadwal lampu...</Text>
        </View>
      </Card>
    );
  }

  // Jika error bukan 404 (misal masalah jaringan)
  if (error && !isNotFound && !jadwal) {
    return (
      <Card className="p-4 border border-slate-200">
        <View className="flex-row items-center justify-between">
          <Text className="font-bold text-xs text-slate-900">Mode Lampu</Text>
          <Ionicons name="alert-circle-outline" size={16} color="#E11D48" />
        </View>
        <Text className="text-xs text-rose-600 mt-2">{error}</Text>
        <PressableOpacity
          onPress={() => refetch()}
          className="mt-3 px-3 py-1.5 bg-slate-50 self-start rounded-lg border border-slate-200"
        >
          <Text className="text-xs font-semibold text-slate-700">Coba Lagi</Text>
        </PressableOpacity>
      </Card>
    );
  }

  // Jika 404 (belum ada jadwal lampu aktif dari backend) atau data tidak tersedia
  if (isNotFound || !jadwal) {
    return (
      <Card className="p-4 border border-slate-200">
        <View className="flex-row items-center justify-between">
          <Text className="font-bold text-xs text-slate-900">Mode Lampu</Text>
          <View className="rounded-full bg-slate-100 px-2.5 py-0.5 border border-slate-300">
            <Text className="text-[11px] font-semibold text-slate-700">
              {schedule?.status || "Nonaktif"}
            </Text>
          </View>
        </View>

        <View className="mt-3 py-2">
          <Text className="text-xs text-slate-600 leading-relaxed italic">
            Belum ada jadwal lampu. Atur lewat dashboard web.
          </Text>
        </View>
      </Card>
    );
  }

  // Format jam nyala: "HH:mm - HH:mm" (potong detik dari "18:00:00")
  const jamMulai = formatTimeToHHmm(jadwal.jam_mulai_nyala);
  const jamAkhir = formatTimeToHHmm(jadwal.jam_akhir_nyala);
  const rentangJam = jamMulai && jamAkhir ? `${jamMulai} - ${jamAkhir}` : "-";

  const isAuto = jadwal.mode === "auto";
  const badgeLabel = isAuto ? "Auto-dimming" : "Manual";

  // Asal jadwal: Khusus blok ini vs Mengikuti jadwal kebun
  const asalJadwal = jadwal.sensor_id
    ? "Khusus blok ini"
    : "Mengikuti jadwal kebun";

  // Detail parameter
  const detailParameter = isAuto
    ? `Target ${jadwal.target_lux ?? 0} lux, minimum ${jadwal.intensitas_minimum ?? 0}%`
    : `Kecerahan ${jadwal.instensitas_cahaya ?? 0}%`;

  return (
    <>
      <Card className="p-4 border border-slate-200">
        {/* Header Kartu: Judul & Badge Mode */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Ionicons
              name={isAuto ? "bulb-outline" : "bulb"}
              size={18}
              color={isAuto ? "#059669" : "#D97706"}
            />
            <Text className="font-bold text-xs text-slate-900">Mode Lampu</Text>
          </View>

          {/* Badge Mode */}
          <View
            className={`rounded-full flex-row py-1 px-2.5 items-center gap-1.5 border ${
              isAuto
                ? "bg-emerald-50 border-emerald-300"
                : "bg-amber-50 border-amber-300"
            }`}
          >
            <Ionicons
              name="ellipse"
              size={7}
              color={isAuto ? "#059669" : "#D97706"}
            />
            <Text
              className={`text-center font-bold text-[11px] ${
                isAuto ? "text-emerald-800" : "text-amber-800"
              }`}
            >
              {badgeLabel}
            </Text>
          </View>
        </View>

        {/* Success Banner sesaat setelah mutasi */}
        {successBanner && (
          <View className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex-row items-center justify-between">
            <Text className="text-[11px] text-emerald-800 font-medium flex-1">
              {successBanner}
            </Text>
            <PressableOpacity onPress={() => setSuccessBanner(null)}>
              <Ionicons name="close" size={14} color="#065F46" />
            </PressableOpacity>
          </View>
        )}

        {/* Konten Jam Nyala */}
        <View className="mt-4 flex-row items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
          <View>
            <Text className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
              Jam Nyala
            </Text>
            <Text className="text-lg font-extrabold text-slate-900 mt-0.5">
              {rentangJam}
            </Text>
          </View>

          {/* Asal Jadwal */}
          <View className="items-end">
            <Text className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
              Asal Jadwal
            </Text>
            <Text className="text-xs font-semibold text-slate-800 mt-0.5">
              {asalJadwal}
            </Text>
          </View>
        </View>

        {/* Detail Parameter */}
        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-xs text-slate-600 font-medium">
            {detailParameter}
          </Text>

          {/* Tombol Aksi: Hanya muncul jika mode saat ini adalah Auto */}
          {isAuto && sensorId && (
            <PressableOpacity
              onPress={() => setModalVisible(true)}
              className="px-3 py-1.5 bg-emerald-700 active:bg-emerald-800 rounded-lg flex-row items-center gap-1.5 shadow-sm"
            >
              <Ionicons name="options-outline" size={14} color="#FFFFFF" />
              <Text className="text-xs font-semibold text-white">
                Ubah ke Manual
              </Text>
            </PressableOpacity>
          )}
        </View>
      </Card>

      {/* Modal Interaktif Pengaturan Manual Dimming */}
      {sensorId && (
        <ManualDimmingModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          jadwalAktif={jadwal}
          sensorId={sensorId}
          onSuccess={(msg) => {
            setSuccessBanner(msg);
          }}
        />
      )}
    </>
  );
}
