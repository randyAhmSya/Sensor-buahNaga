import React, { memo } from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/component/ui/Card";
import type { BackendNodeRingkasanDTO } from "@/types/api/nodeRingkasan.dto";

interface DimmingReadinessCardProps {
  ringkasan: BackendNodeRingkasanDTO;
}

function formatJamSingkat(jam?: string | null): string {
  if (!jam || typeof jam !== "string") return "-";
  const trimmed = jam.trim();
  if (trimmed.length >= 5) {
    return trimmed.slice(0, 5);
  }
  return trimmed || "-";
}

export const DimmingReadinessCard = memo(function DimmingReadinessCard({
  ringkasan,
}: DimmingReadinessCardProps) {
  // 5 Syarat Konfigurasi Utama
  const isOnline = Boolean(ringkasan.node.status_online);
  const hasReading = ringkasan.bacaan_terakhir !== null;
  const hasSchedule = ringkasan.jadwal.sumber !== "belum_ada";
  const isAutoMode = ringkasan.jadwal.jadwal?.mode === "auto";
  const hasTargetLux =
    ringkasan.jadwal.jadwal?.target_lux != null &&
    ringkasan.jadwal.jadwal.target_lux > 0;

  // Syarat Waktu Terpisah (tidak dihitung dalam badge konfigurasi)
  const isWithinWindow = Boolean(ringkasan.jadwal.sedang_dalam_jendela_nyala);

  const configRequirements = [
    {
      id: "online",
      title: "Node online",
      isMet: isOnline,
      hint: isOnline
        ? "Sensor aktif dan terhubung ke gateway."
        : "Nyalakan sensor dan pastikan gateway terhubung.",
    },
    {
      id: "lux",
      title: "Data cahaya masuk",
      isMet: hasReading,
      hint: hasReading
        ? `Data lux sensor tercatat (${ringkasan.bacaan_terakhir?.nilai_lux ?? 0} lx).`
        : "Belum ada data lux dari sensor.",
    },
    {
      id: "schedule",
      title: "Jadwal lampu tersedia",
      isMet: hasSchedule,
      hint: hasSchedule
        ? `Jadwal aktif tersedia (${ringkasan.jadwal.sumber === "override" ? "khusus node" : "blok atau kebun"}).`
        : "Buat jadwal lampu untuk kebun atau blok ini.",
    },
    {
      id: "mode",
      title: "Mode Auto aktif",
      isMet: isAutoMode,
      hint: isAutoMode
        ? "Mode jadwal telah diatur ke Auto."
        : "Ubah mode jadwal ke Auto.",
    },
    {
      id: "target_lux",
      title: "Target lux terisi",
      isMet: hasTargetLux,
      hint: hasTargetLux
        ? `Target lux terkonfigurasi (${ringkasan.jadwal.jadwal?.target_lux} lx).`
        : "Isi target lux pada jadwal.",
    },
  ];

  const metCount = configRequirements.filter((r) => r.isMet).length;
  const isAllConfigMet = metCount === 5;

  const jamMulai = formatJamSingkat(ringkasan.jadwal.jadwal?.jam_mulai_nyala);
  const jamAkhir = formatJamSingkat(ringkasan.jadwal.jadwal?.jam_akhir_nyala);
  const waktuHint =
    jamMulai !== "-" && jamAkhir !== "-"
      ? `Dimming hanya tercatat pada jam ${jamMulai} sampai ${jamAkhir}.`
      : "Dimming hanya tercatat pada jam nyala jadwal.";

  return (
    <Card className="border border-slate-200 bg-white p-4">
      {/* Header Kartu */}
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-2">
          <Text className="text-sm font-bold text-slate-900">
            Kesiapan Auto-Dimming
          </Text>
          <Text className="text-[11px] font-medium text-slate-500 mt-0.5">
            Evaluasi syarat otomatisasi peredupan lampu
          </Text>
        </View>

        <View
          className={`rounded-full px-2.5 py-1 border ${
            isAllConfigMet
              ? "bg-emerald-50 border-emerald-300"
              : "bg-slate-50 border-slate-300"
          }`}
        >
          <Text
            className={`text-[11px] font-bold ${
              isAllConfigMet ? "text-emerald-800" : "text-slate-700"
            }`}
          >
            {metCount} dari 5 syarat konfigurasi terpenuhi
          </Text>
        </View>
      </View>

      {/* Banner Kesiapan Sistem jika 5 syarat konfigurasi terpenuhi */}
      {isAllConfigMet && (
        <View className="mt-3.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <View className="flex-row items-center gap-2">
            <Ionicons name="checkmark-circle" size={18} color="#047857" />
            <Text className="text-xs font-bold text-emerald-900 flex-1">
              Siap. Titik grafik terisi tiap 10 menit saat telemetri masuk.
            </Text>
          </View>
          {!isWithinWindow && (
            <Text className="text-[11px] font-medium text-emerald-800 mt-1 pl-6">
              Saat ini di luar jam nyala, grafik terisi lagi pada jam {jamMulai}.
            </Text>
          )}
        </View>
      )}

      {/* Daftar 5 Syarat Konfigurasi */}
      <View className="mt-3.5 border-t border-slate-100 pt-3">
        {configRequirements.map((item) => (
          <View key={item.id} className="flex-row items-start gap-2.5 mb-2.5">
            <Ionicons
              name={item.isMet ? "checkmark-circle" : "close-circle-outline"}
              size={18}
              color={item.isMet ? "#047857" : "#64748B"}
              style={{ marginTop: 1 }}
            />
            <View className="flex-1">
              <Text className="text-xs font-semibold text-slate-900">
                {item.title}
              </Text>
              <Text className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                {item.hint}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Syarat 6: Informasi Waktu Jam Nyala (Terpisah, Netral, Tidak Dihitung) */}
      <View className="mt-1 pt-2.5 border-t border-slate-100">
        <View className="flex-row items-start gap-2.5">
          <Ionicons
            name="time-outline"
            size={18}
            color="#64748B"
            style={{ marginTop: 1 }}
          />
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-semibold text-slate-700">
                Dalam jam nyala
              </Text>
              <Text className="text-[10px] font-semibold text-slate-500">
                Informasi Waktu
              </Text>
            </View>
            <Text className="text-[11px] text-slate-600 mt-0.5 leading-tight">
              {isWithinWindow
                ? "Saat ini berada di dalam jendela jam nyala lampu."
                : waktuHint}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
});
