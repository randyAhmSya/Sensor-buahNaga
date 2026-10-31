import React, { useState } from "react";
import { Text, View } from "react-native";
import { Card } from "@/component/ui/Card";
import { StatusBadge } from "@/component/ui/StatusBadge";
import { Ionicons } from "@expo/vector-icons";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import type { NodeRingkasanJadwal } from "@/types/api/nodeRingkasan.dto";
import type { JadwalLampuAktif } from "@/types/jadwalLampu";
import type { BadgeTone } from "@/theme/tokens";
import { formatJamMenit } from "@/utils/date";
import { ManualDimmingModal } from "./ManualDimmingModal";

interface Props {
  sensorId?: string;
  jadwalInfo: NodeRingkasanJadwal;
  onRefresh?: () => void;
}

export function LightingScheduleCard({ sensorId, jadwalInfo, onRefresh }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const detail = jadwalInfo.jadwal;
  const isBelumAda = jadwalInfo.sumber === "belum_ada" || !detail;
  const isAuto = detail?.mode === "auto";

  let modeTone: BadgeTone = "neutral";
  let modeLabel = "Belum Ada Jadwal";

  if (!isBelumAda) {
    if (isAuto) {
      modeTone = "success";
      modeLabel = "Auto-dimming";
    } else {
      modeTone = "info";
      modeLabel = "Manual";
    }
  }

  // Rekonstruksi objek jadwalAktif untuk modal override
  const jadwalAktifObj: JadwalLampuAktif = {
    id_jadwal_lampu: "",
    kebun_id: null,
    sensor_id: jadwalInfo.sumber === "override" ? (sensorId || null) : null,
    jam_mulai_nyala: detail?.jam_mulai_nyala || "18:00:00",
    jam_akhir_nyala: detail?.jam_akhir_nyala || "05:00:00",
    mode: detail?.mode || "auto",
    instensitas_cahaya: detail?.instensitas_cahaya ?? 100,
    baseline_manual_persen: detail?.baseline_manual_persen ?? 80,
    target_lux: detail?.target_lux ?? null,
    intensitas_minimum: detail?.intensitas_minimum ?? null,
    status_aktif: true,
    keterangan: null,
  };

  // Asal Jadwal
  let asalJadwal = "Belum ada jadwal";
  if (jadwalInfo.sumber === "override") {
    asalJadwal = "Khusus node ini";
  } else if (jadwalInfo.sumber === "default") {
    asalJadwal = "Mengikuti jadwal kebun";
  }

  // Jam Nyala
  const jamMulai = detail ? formatJamMenit(detail.jam_mulai_nyala) : "-";
  const jamAkhir = detail ? formatJamMenit(detail.jam_akhir_nyala) : "-";
  const rentangJam = detail && jamMulai !== "-" ? `${jamMulai} - ${jamAkhir}` : "Belum diatur";

  // Detail Parameter
  const detailParameter = isBelumAda
    ? "Jadwal pencahayaan belum dikonfigurasi."
    : isAuto
      ? `Target ${detail.target_lux ?? 0} lux, minimum ${detail.intensitas_minimum ?? 0}%`
      : `Kecerahan tetap ${detail.instensitas_cahaya ?? detail.baseline_manual_persen ?? 0}%`;

  return (
    <>
      <Card className="p-4 border border-slate-200 bg-white">
        {/* Header Kartu: Judul & Badge Mode Solid */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-lg bg-white border-[1.5px] border-slate-400">
              <Ionicons name="bulb-outline" size={20} color="#334155" />
            </View>
            <Text className="font-bold text-sm text-slate-900">Mode Lampu</Text>
          </View>

          {/* Badge Mode: Auto = success, Manual = info, Belum ada = neutral */}
          <StatusBadge tone={modeTone} label={modeLabel} size="sm" />
        </View>

        {/* Success Banner jika baru saja mengubah mode manual */}
        {successBanner && (
          <View className="mt-3 p-2.5 bg-emerald-700 rounded-md flex-row items-center justify-between">
            <Text className="text-xs text-white font-bold flex-1">
              {successBanner}
            </Text>
            <PressableOpacity onPress={() => setSuccessBanner(null)}>
              <Ionicons name="close" size={16} color="#FFFFFF" />
            </PressableOpacity>
          </View>
        )}

        {/* Konten Jam Nyala & Asal Jadwal */}
        <View className="mt-3.5 flex-row items-center justify-between bg-white p-3 rounded-lg border-[1.5px] border-slate-400">
          <View>
            <Text className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
              Jam Nyala
            </Text>
            <Text className="text-base font-extrabold text-slate-900 mt-0.5">
              {rentangJam}
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
              Asal Jadwal
            </Text>
            <Text className="text-xs font-bold text-slate-800 mt-0.5">
              {asalJadwal}
            </Text>
          </View>
        </View>

        {/* Status Jendela Jam Nyala */}
        <View className="mt-3 flex-row items-center gap-2">
          <View
            className={`w-2 h-2 rounded-full ${
              jadwalInfo.sedang_dalam_jendela_nyala ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          <Text className="text-xs font-semibold text-slate-700">
            {jadwalInfo.sedang_dalam_jendela_nyala
              ? "Sedang dalam jam nyala"
              : "Di luar jam nyala"}
          </Text>
        </View>

        {/* Detail Parameter & Tombol Aksi Manual */}
        <View className="mt-3 pt-3 border-t border-slate-200 flex-row items-center justify-between">
          <Text className="text-xs text-slate-600 font-medium flex-1 mr-2">
            {detailParameter}
          </Text>

          {isAuto && sensorId && (
            <PressableOpacity
              onPress={() => setModalVisible(true)}
              className="px-3 py-1.5 bg-emerald-700 active:bg-emerald-800 rounded-lg flex-row items-center gap-1.5 shadow-sm"
            >
              <Ionicons name="options-outline" size={14} color="#FFFFFF" />
              <Text className="text-xs font-bold text-white">Ubah Manual</Text>
            </PressableOpacity>
          )}
        </View>
      </Card>

      {/* Modal Dialog Dimming Manual */}
      {modalVisible && sensorId && (
        <ManualDimmingModal
          visible={modalVisible}
          sensorId={sensorId}
          jadwalAktif={jadwalAktifObj}
          onClose={() => setModalVisible(false)}
          onSuccess={(msg) => {
            setSuccessBanner(msg);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </>
  );
}
