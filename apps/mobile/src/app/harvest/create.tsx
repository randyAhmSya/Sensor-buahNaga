import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/service/apiClient';
import { useKebunList } from '@/hooks/useKebun';
import { useCreateHarvestMutation } from '@/hooks/useHarvest';
import { formatTanggalPetani } from '@/types/harvest';
import { PressableOpacity } from '@/component/ui/PressableOpacity';
import type { BackendKebunDTO } from '@/types/api';
import type { BackendBlokDTO } from '@/service/dashboardService';

export default function CreateHarvestScreen() {
  const [selectedKebunId, setSelectedKebunId] = useState<string>('');
  const [selectedBlokId, setSelectedBlokId] = useState<string>('');
  const [tanggalPenyinaran, setTanggalPenyinaran] = useState(() =>
    new Date().toISOString().split('T')[0],
  );
  const [targetBunga, setTargetBunga] = useState('21');
  const [targetPanen, setTargetPanen] = useState('50');

  // Ambil data kebun via cache terpusat
  const { data: kebunList = [], isLoading: isLoadingKebun } = useKebunList();

  // Pilih kebun pertama secara default
  useEffect(() => {
    if (kebunList.length > 0 && !selectedKebunId) {
      setSelectedKebunId(kebunList[0].id_kebun);
    }
  }, [kebunList, selectedKebunId]);

  // Ambil data blok berdasarkan kebun terpilih
  const { data: blokList = [], isLoading: isLoadingBlok } = useQuery<BackendBlokDTO[]>({
    queryKey: ['petani', 'blok', selectedKebunId],
    queryFn: async () => {
      if (!selectedKebunId) return [];
      const res = await apiClient.get<{ data: BackendBlokDTO[] }>('/petani/blok', {
        params: { kebun_id: selectedKebunId },
      });
      return res.data?.data || [];
    },
    enabled: !!selectedKebunId,
  });

  // Pilih blok pertama secara default
  useEffect(() => {
    if (blokList.length > 0) {
      setSelectedBlokId(blokList[0].id_blok);
    } else {
      setSelectedBlokId('');
    }
  }, [blokList]);

  // Mutasi create siklus
  const createMutation = useCreateHarvestMutation();

  // Kalkulasi preview ramah petani
  const targetBungaNum = parseInt(targetBunga, 10) || 21;
  const targetPanenNum = parseInt(targetPanen, 10) || 50;
  const totalHariEstimasi = targetBungaNum + targetPanenNum;

  let calculatedEstimatedDate = '-';
  try {
    const startDate = new Date(tanggalPenyinaran);
    if (!isNaN(startDate.getTime())) {
      const estDate = new Date(startDate.getTime() + totalHariEstimasi * 24 * 60 * 60 * 1000);
      calculatedEstimatedDate = formatTanggalPetani(estDate.toISOString());
    }
  } catch {
    calculatedEstimatedDate = '-';
  }

  const handleSubmit = () => {
    if (!selectedBlokId) {
      Alert.alert('Pilih Blok', 'Silakan pilih blok lahan untuk memulai siklus penyinaran.');
      return;
    }
    if (!tanggalPenyinaran || !/^\d{4}-\d{2}-\d{2}$/.test(tanggalPenyinaran)) {
      Alert.alert('Tanggal Salah', 'Masukkan format tanggal penyinaran YYYY-MM-DD yang benar.');
      return;
    }

    createMutation.mutate(
      {
        block_id: selectedBlokId,
        tanggal_penyinaran: tanggalPenyinaran,
        target_hari_berbunga: targetBungaNum,
        target_hari_panen_setelah_bunga: targetPanenNum,
      },
      {
        onSuccess: (data) => {
          Alert.alert('Sukses', 'Siklus penyinaran berhasil didaftarkan.', [
            {
              text: 'Buka Detail',
              onPress: () => {
                if (data?.id_siklus_panen) {
                  router.replace({
                    pathname: '/harvest/[id]',
                    params: { id: data.id_siklus_panen },
                  });
                } else {
                  router.back();
                }
              },
            },
            {
              text: 'Selesai',
              onPress: () => router.back(),
              style: 'cancel',
            },
          ]);
        },
        onError: (err: unknown) => {
          const message =
            err instanceof Error
              ? err.message
              : 'Gagal memulai siklus penyinaran. Pastikan koneksi stabil.';
          Alert.alert('Gagal', message);
        },
      },
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Mulai Siklus Penyinaran',
          headerBackTitle: 'Kembali',
        }}
      />

      <ScrollView
        className="flex-1 bg-slate-50"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Header Hero Card */}
        <View className="bg-emerald-800 rounded-lg p-5 mb-5 shadow-sm border border-emerald-700">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="sunny" size={24} color="#FDE047" />
            <Text className="text-white font-bold text-base">
              Penyinaran Lampu & Estimasi Panen
            </Text>
          </View>
          <Text className="text-emerald-100 text-xs leading-4">
            Catat tanggal dimulainya lampu induksi bunga buah naga di blok lahan Anda.
            Sistem otomatis memproyeksikan tanggal mekar bunga dan masa panen.
          </Text>
        </View>

        {/* Pemilihan Kebun */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-slate-200 shadow-sm">
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            1. Pilih Kebun
          </Text>
          {isLoadingKebun ? (
            <ActivityIndicator size="small" color="#047857" />
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {kebunList.map((k) => {
                const isSelected = selectedKebunId === k.id_kebun;
                return (
                  <PressableOpacity
                    key={k.id_kebun}
                    onPress={() => setSelectedKebunId(k.id_kebun)}
                    className={`px-3 py-2 rounded-lg border ${
                      isSelected
                        ? 'bg-emerald-700 border-emerald-700'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? 'text-white' : 'text-slate-700'
                      }`}
                    >
                      {k.nama_kebun}
                    </Text>
                  </PressableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Pemilihan Blok */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-slate-200 shadow-sm">
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            2. Pilih Blok Lahan
          </Text>
          {isLoadingBlok ? (
            <ActivityIndicator size="small" color="#047857" />
          ) : blokList.length === 0 ? (
            <Text className="text-xs text-slate-400">Tidak ada blok pada kebun ini.</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {blokList.map((b) => {
                const isSelected = selectedBlokId === b.id_blok;
                return (
                  <PressableOpacity
                    key={b.id_blok}
                    onPress={() => setSelectedBlokId(b.id_blok)}
                    className={`px-3 py-2 rounded-lg border ${
                      isSelected
                        ? 'bg-emerald-700 border-emerald-700'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        isSelected ? 'text-white' : 'text-slate-700'
                      }`}
                    >
                      {b.nama_blok}
                    </Text>
                  </PressableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Parameter Siklus */}
        <View className="bg-white rounded-lg p-4 mb-4 border border-slate-200 shadow-sm gap-3">
          <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            3. Parameter Penyinaran
          </Text>

          <View>
            <Text className="text-xs text-slate-600 mb-1 font-medium">
              Tanggal Mulai Penyinaran (YYYY-MM-DD):
            </Text>
            <TextInput
              value={tanggalPenyinaran}
              onChangeText={setTanggalPenyinaran}
              className="border-[1.5px] border-slate-400 rounded-lg px-4 py-2.5 bg-white text-sm text-slate-900"
              placeholder="2026-10-26"
            />
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-slate-600 mb-1 font-medium">
                Target Berbunga (hari):
              </Text>
              <TextInput
                value={targetBunga}
                onChangeText={setTargetBunga}
                keyboardType="numeric"
                className="border-[1.5px] border-slate-400 rounded-lg px-4 py-2.5 bg-white text-sm text-slate-900"
                placeholder="21"
              />
            </View>

            <View className="flex-1">
              <Text className="text-xs text-slate-600 mb-1 font-medium">
                Target Panen Bunga (hari):
              </Text>
              <TextInput
                value={targetPanen}
                onChangeText={setTargetPanen}
                keyboardType="numeric"
                className="border-[1.5px] border-slate-400 rounded-lg px-4 py-2.5 bg-white text-sm text-slate-900"
                placeholder="50"
              />
            </View>
          </View>
        </View>

        {/* Live Preview Card */}
        <View className="bg-white border-[1.5px] border-amber-500 rounded-lg p-4 mb-6 shadow-sm">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="calculator-outline" size={18} color="#B45309" />
            <Text className="text-xs font-bold text-amber-900 uppercase">
              Proyeksi Hasil Perhitungan
            </Text>
          </View>

          <View className="flex-row justify-between py-1 border-b border-amber-200">
            <Text className="text-xs text-amber-800">Total Durasi Siklus:</Text>
            <Text className="text-xs font-bold text-amber-900">{totalHariEstimasi} Hari</Text>
          </View>
          <View className="flex-row justify-between py-1 pt-2">
            <Text className="text-xs text-amber-800">Estimasi Tanggal Panen:</Text>
            <Text className="text-xs font-bold text-emerald-800">{calculatedEstimatedDate}</Text>
          </View>
        </View>

        {/* Submit Button */}
        <PressableOpacity
          onPress={handleSubmit}
          disabled={createMutation.isPending}
          className="bg-emerald-700 py-3.5 rounded-lg items-center justify-center shadow-sm active:bg-emerald-800"
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text className="text-white font-bold text-base">
              Mulai Siklus Penyinaran
            </Text>
          )}
        </PressableOpacity>
      </ScrollView>
    </>
  );
}
