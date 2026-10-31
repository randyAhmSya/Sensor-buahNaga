import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PressableOpacity } from "@/component/ui/PressableOpacity";
import { useOverrideJadwalManualMutation } from "@/hooks/useJadwalLampu";
import type { JadwalLampuAktif, JadwalErrorDetails } from "@/types/jadwalLampu";

interface ManualDimmingModalProps {
  visible: boolean;
  onClose: () => void;
  jadwalAktif: JadwalLampuAktif;
  sensorId: string;
  onSuccess?: (message: string) => void;
}

const PRESET_VALUES = [25, 50, 75, 100] as const;

export function ManualDimmingModal({
  visible,
  onClose,
  jadwalAktif,
  sensorId,
  onSuccess,
}: ManualDimmingModalProps) {
  // Hitung initial value dari baseline_manual_persen atau fallback 80
  const initialValue =
    typeof jadwalAktif.baseline_manual_persen === "number" &&
    !isNaN(jadwalAktif.baseline_manual_persen)
      ? Math.max(0, Math.min(100, Math.round(jadwalAktif.baseline_manual_persen)))
      : 80;

  const [brightness, setBrightness] = useState<number>(initialValue);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  const overrideMutation = useOverrideJadwalManualMutation();

  // Reset state saat modal dibuka
  useEffect(() => {
    if (visible) {
      setBrightness(initialValue);
      setErrorMessage(null);
      setCooldownSeconds(0);
    }
  }, [visible, initialValue]);

  // Timer countdown untuk cooldown HTTP 429
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleDecrease = () => {
    if (cooldownSeconds > 0 || overrideMutation.isPending) return;
    setBrightness((prev) => Math.max(0, prev - 5));
    setErrorMessage(null);
  };

  const handleIncrease = () => {
    if (cooldownSeconds > 0 || overrideMutation.isPending) return;
    setBrightness((prev) => Math.min(100, prev + 5));
    setErrorMessage(null);
  };

  const handleSelectPreset = (value: number) => {
    if (cooldownSeconds > 0 || overrideMutation.isPending) return;
    setBrightness(value);
    setErrorMessage(null);
  };

  const handleConfirm = async () => {
    if (cooldownSeconds > 0 || overrideMutation.isPending) return;

    setErrorMessage(null);
    try {
      const result = await overrideMutation.mutateAsync({
        jadwalAktif,
        sensorId,
        intensitasCahaya: brightness,
      });

      const successMsg =
        result.instensitas_cahaya !== null && result.instensitas_cahaya !== undefined
          ? `Mode manual aktif dengan kecerahan ${result.instensitas_cahaya}%.`
          : "Mode manual berhasil diaktifkan.";

      if (onSuccess) {
        onSuccess(successMsg);
      } else {
        Alert.alert("Berhasil", successMsg);
      }

      onClose();
    } catch (err: unknown) {
      const errorDetails = err as JadwalErrorDetails;

      // Jika error 429 (rate limit cooldown), kembalikan nilai slider ke nilai server & kunci kontrol
      if (errorDetails.status === 429) {
        setBrightness(initialValue);
        const retrySeconds = errorDetails.retryAfterSeconds || 7;
        setCooldownSeconds(retrySeconds);
        setErrorMessage(null);
      } else {
        setErrorMessage(errorDetails.message || "Gagal mengubah mode ke manual.");
      }
    }
  };

  const isButtonDisabled = overrideMutation.isPending || cooldownSeconds > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white rounded-t-xl p-6 pb-9 shadow-2xl">
          {/* Header Modal */}
          <View className="flex-row items-center justify-between pb-3 border-b border-gray-100">
            <View>
              <Text className="text-base font-bold text-gray-900">
                Ubah ke Mode Manual
              </Text>
              <Text className="text-xs text-gray-500 mt-0.5">
                Atur kecerahan lampu khusus untuk blok ini
              </Text>
            </View>
            <PressableOpacity
              onPress={onClose}
              disabled={overrideMutation.isPending}
              className="p-1.5 rounded-lg bg-gray-100"
            >
              <Ionicons name="close" size={20} color="#4B5563" />
            </PressableOpacity>
          </View>

          {/* Banner Error / Cooldown */}
          {errorMessage && (
            <View className="mt-4 p-3 bg-white border-[1.5px] border-rose-600 rounded-lg flex-row items-start gap-2">
              <Ionicons
                name="alert-circle"
                size={18}
                color="#DC2626"
                className="mt-0.5"
              />
              <Text className="flex-1 text-xs text-red-700 leading-tight">
                {errorMessage}
              </Text>
            </View>
          )}

          {cooldownSeconds > 0 && (
            <View className="mt-3 p-2.5 bg-white border-[1.5px] border-amber-500 rounded-lg flex-row items-center gap-2">
              <Ionicons name="time-outline" size={16} color="#D97706" />
              <Text className="text-xs text-amber-800 font-medium">
                Coba lagi dalam {cooldownSeconds} detik.
              </Text>
            </View>
          )}

          {/* Stepper & Nilai Persentase */}
          <View className="my-6 items-center">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Kecerahan Lampu
            </Text>

            <View className="flex-row items-center justify-center gap-6">
              {/* Tombol Kurang (-) */}
              <PressableOpacity
                onPress={handleDecrease}
                disabled={brightness <= 0 || isButtonDisabled}
                className={`w-12 h-12 rounded-lg items-center justify-center border ${
                  brightness <= 0 || isButtonDisabled
                    ? "bg-gray-100 border-gray-200 opacity-40"
                    : "bg-white border-[1.5px] border-slate-400"
                }`}
              >
                <Ionicons
                  name="remove"
                  size={24}
                  color={
                    brightness <= 0 || isButtonDisabled ? "#9CA3AF" : "#047857"
                  }
                />
              </PressableOpacity>

              {/* Display Angka Besar */}
              <View className="min-w-[120px] items-center">
                <Text className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  {brightness}%
                </Text>
              </View>

              {/* Tombol Tambah (+) */}
              <PressableOpacity
                onPress={handleIncrease}
                disabled={brightness >= 100 || isButtonDisabled}
                className={`w-12 h-12 rounded-lg items-center justify-center border ${
                  brightness >= 100 || isButtonDisabled
                    ? "bg-gray-100 border-gray-200 opacity-40"
                    : "bg-white border-[1.5px] border-slate-400"
                }`}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color={
                    brightness >= 100 || isButtonDisabled ? "#9CA3AF" : "#047857"
                  }
                />
              </PressableOpacity>
            </View>

            {/* Visual Bar Progres Kecerahan (Pure JavaScript/React Native) */}
            <View className="w-full mt-5">
              <View className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <View
                  style={{ width: `${brightness}%` }}
                  className="h-full bg-emerald-600 rounded-full"
                />
              </View>
              <View className="flex-row justify-between mt-1 px-0.5">
                <Text className="text-[10px] text-gray-400 font-medium">0%</Text>
                <Text className="text-[10px] text-gray-400 font-medium">50%</Text>
                <Text className="text-[10px] text-gray-400 font-medium">100%</Text>
              </View>
            </View>

            {/* Tombol Preset Cepat */}
            <View className="flex-row w-full gap-2 mt-4">
              {PRESET_VALUES.map((preset) => {
                const isSelected = brightness === preset;
                return (
                  <PressableOpacity
                    key={preset}
                    onPress={() => handleSelectPreset(preset)}
                    disabled={isButtonDisabled}
                    className={`flex-1 py-2 rounded-lg border items-center justify-center ${
                      isSelected
                        ? "bg-[#047857] border-[1.5px] border-[#047857]"
                        : "bg-white border-[1.5px] border-slate-400"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {preset}%
                    </Text>
                  </PressableOpacity>
                );
              })}
            </View>

            {/* Keterangan Dampak */}
            <View className="mt-4 p-3 bg-white rounded-lg w-full border-[1.5px] border-slate-400 flex-row items-center gap-2">
              <Ionicons name="information-circle" size={16} color="#059669" />
              <Text className="flex-1 text-[11px] text-gray-600 leading-relaxed">
                Lampu blok ini akan menyala tetap di kecerahan ini selama jam
                nyala. Blok lain tidak terpengaruh.
              </Text>
            </View>
          </View>

          {/* Action Buttons: Konfirmasi & Batal */}
          <View className="flex-row gap-3">
            <PressableOpacity
              onPress={onClose}
              disabled={overrideMutation.isPending}
              className="flex-1 py-3.5 rounded-lg bg-white items-center justify-center border-[1.5px] border-slate-400"
            >
              <Text className="text-sm font-semibold text-gray-700">Batal</Text>
            </PressableOpacity>

            <PressableOpacity
              onPress={handleConfirm}
              disabled={isButtonDisabled}
              className={`flex-1 py-3.5 rounded-lg items-center justify-center ${
                isButtonDisabled
                  ? "bg-emerald-300 opacity-70"
                  : "bg-emerald-700 active:bg-emerald-800"
              }`}
            >
              {overrideMutation.isPending ? (
                <View className="flex-row items-center gap-2">
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text className="text-sm font-semibold text-white">
                    Menyimpan...
                  </Text>
                </View>
              ) : cooldownSeconds > 0 ? (
                <Text className="text-sm font-semibold text-white">
                  Tunggu ({cooldownSeconds}s)
                </Text>
              ) : (
                <Text className="text-sm font-semibold text-white">
                  Konfirmasi
                </Text>
              )}
            </PressableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
