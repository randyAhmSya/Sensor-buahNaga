import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/service/apiClient';
import { useCreateHarvestMutation } from '@/hooks/useHarvest';
import { formatTanggalPetani } from '@/types/harvest';
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

  // Ambil data kebun
  const { data: kebunList = [], isLoading: isLoadingKebun } = useQuery<BackendKebunDTO[]>({
    queryKey: ['petani', 'kebun'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: BackendKebunDTO[] }>('/petani/kebun');
      return res.data?.data || [];
    },
  });

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

    // Body JSON wajib mengirim block_id sesuai validator addSiklusPanenRequest
    createMutation.mutate(
      {
        block_id: selectedBlokId,
        tanggal_penyinaran: tanggalPenyinaran,
        target_hari_berbunga: targetBungaNum,
        target_hari_panen_setelah_bunga: targetPanenNum,
      },
      {
        onSuccess: (data) => {
          Alert.alert(
            'Siklus Berhasil Dimulai',
            'Siklus penyinaran baru telah aktif tercatat di sistem.',
            [
              {
                text: 'Buka Detail Siklus',
                onPress: () => {
                  router.replace({
                    pathname: '/harvest/[id]',
                    params: { id: data.id_siklus_panen },
                  });
                },
              },
            ],
          );
        },
        onError: (err) => {
          Alert.alert('Gagal Memulai Siklus', err.message || 'Terjadi kesalahan sistem.');
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
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Header Hero Card */}
        <View className="bg-green-800 rounded-2xl p-5 mb-5 shadow-sm">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="sunny" size={24} color="#FDE047" />
            <Text className="text-white font-bold text-base">
              Penyinaran Lampu & Estimasi Panen
            </Text>
          </View>
          <Text className="text-green-100 text-xs leading-4">
            Catat tanggal dimulainya lampu induksi bunga buah naga di blok lahan Anda.
            Sistem otomatis memproyeksikan tanggal mekar bunga dan masa panen.
          </Text>
        </View>

        {/* Pemilihan Kebun */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm">
          <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            1. Pilih Kebun
          </Text>
          {isLoadingKebun ? (
            <ActivityIndicator size="small" color="#166534" />
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {kebunList.map((k) => {
                const isSelected = selectedKebunId === k.id_kebun;
                return (
                  <Pressable
                    key={k.id_kebun}
                    onPress={() => setSelectedKebunId(k.id_kebun)}
                    className={`px-3 py-2 rounded-lg border ${
                      isSelected
                        ? 'bg-green-50 border-green-600'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? 'text-green-800 font-bold' : 'text-gray-700'
                      }`}
                    >
                      {k.nama_kebun}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Pemilihan Blok */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm">
          <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            2. Pilih Blok Lahan
          </Text>
          {isLoadingBlok ? (
            <ActivityIndicator size="small" color="#166534" />
          ) : blokList.length === 0 ? (
            <Text className="text-xs text-gray-400">Tidak ada blok pada kebun ini.</Text>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {blokList.map((b) => {
                const isSelected = selectedBlokId === b.id_blok;
                return (
                  <Pressable
                    key={b.id_blok}
                    onPress={() => setSelectedBlokId(b.id_blok)}
                    className={`px-3 py-2 rounded-lg border ${
                      isSelected
                        ? 'bg-green-50 border-green-600'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? 'text-green-800 font-bold' : 'text-gray-700'
                      }`}
                    >
                      {b.nama_blok}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Parameter Siklus */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm gap-3">
          <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            3. Parameter Penyinaran
          </Text>

          <View>
            <Text className="text-xs text-gray-600 mb-1 font-medium">
              Tanggal Mulai Penyinaran (YYYY-MM-DD):
            </Text>
            <TextInput
              value={tanggalPenyinaran}
              onChangeText={setTanggalPenyinaran}
              className="border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-sm text-gray-900"
              placeholder="2026-10-26"
            />
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs text-gray-600 mb-1 font-medium">
                Target Berbunga (hari):
              </Text>
              <TextInput
                value={targetBunga}
                onChangeText={setTargetBunga}
                keyboardType="numeric"
                className="border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-sm text-gray-900"
                placeholder="21"
              />
            </View>

            <View className="flex-1">
              <Text className="text-xs text-gray-600 mb-1 font-medium">
                Target Panen Bunga (hari):
              </Text>
              <TextInput
                value={targetPanen}
                onChangeText={setTargetPanen}
                keyboardType="numeric"
                className="border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 text-sm text-gray-900"
                placeholder="50"
              />
            </View>
          </View>
        </View>

        {/* Live Preview Card */}
        <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 shadow-sm">
          <View className="flex-row items-center gap-2 mb-2">
            <Ionicons name="calculator-outline" size={18} color="#B45309" />
            <Text className="text-xs font-bold text-amber-900 uppercase">
              Proyeksi Hasil Perhitungan
            </Text>
          </View>

          <View className="flex-row justify-between py-1 border-b border-amber-200/50">
            <Text className="text-xs text-amber-800">Total Durasi Siklus:</Text>
            <Text className="text-xs font-bold text-amber-900">{totalHariEstimasi} Hari</Text>
          </View>
          <View className="flex-row justify-between py-1 pt-2">
            <Text className="text-xs text-amber-800">Estimasi Tanggal Panen:</Text>
            <Text className="text-xs font-bold text-green-800">{calculatedEstimatedDate}</Text>
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          disabled={createMutation.isPending}
          className="bg-green-700 py-3.5 rounded-xl items-center justify-center shadow-sm active:bg-green-800"
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text className="text-white font-bold text-base">
              Mulai Siklus Penyinaran
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </>
  );
}